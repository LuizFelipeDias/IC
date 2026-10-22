<?php

use App\Contracts\AntivirusScanner;
use App\Models\AnexoDocumento;
use App\Models\Projeto;
use App\Models\Usuario;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Support\ArquivosDeTeste;

beforeEach(function () {
    Storage::fake('local');
});

function antivirusRespondendo(string $resultado): void
{
    app()->bind(AntivirusScanner::class, fn () => new class($resultado) implements AntivirusScanner
    {
        public function __construct(private string $resultado) {}

        public function verificar(string $caminhoAbsoluto): string
        {
            return $this->resultado;
        }
    });
}

it('aceita STL e 3MF reais, mede o modelo e guarda em disco privado com hash', function (string $formato) {
    antivirusRespondendo(AntivirusScanner::LIMPO);
    $projeto = Projeto::factory()->create();
    Sanctum::actingAs($projeto->usuario);

    $arquivo = $formato === 'stl' ? ArquivosDeTeste::stlBinario() : ArquivosDeTeste::arquivo3mf();

    $resposta = $this->post("/api/projeto/{$projeto->id}/anexos", ['tipo' => 'modelo', 'arquivo' => $arquivo], ['Accept' => 'application/json'])
        ->assertCreated()
        ->assertJsonPath('tipo', 'modelo')
        ->assertJsonPath('status_verificacao', 'aprovado')
        ->assertJsonPath('metadados.triangulos', 12)
        ->assertJsonPath('metadados.volume_cm3', 1)
        ->assertJsonPath('metadados.dimensoes_mm.x', 10);

    $anexo = AnexoDocumento::find($resposta->json('id'));
    Storage::disk('local')->assertExists($anexo->url_arquivo);
    expect($anexo->url_arquivo)->toStartWith('anexos/modelo/')
        ->and($anexo->sha256)->toHaveLength(64)
        ->and($projeto->fresh()->status->value)->toBe('em_revisao');
})->with(['stl', '3mf']);

it('rejeita arquivos que não são o que dizem ser', function (UploadedFile $arquivo, string $mensagem) {
    $projeto = Projeto::factory()->create();
    Sanctum::actingAs($projeto->usuario);

    $this->post("/api/projeto/{$projeto->id}/anexos", ['tipo' => 'modelo', 'arquivo' => $arquivo], ['Accept' => 'application/json'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.arquivo.0', $mensagem);
})->with([
    'executável renomeado' => [fn () => UploadedFile::fake()->createWithContent('peca.stl', "MZ\x90\0binario qualquer"), 'O arquivo não é um STL válido.'],
    'extensão não aceita' => [fn () => UploadedFile::fake()->createWithContent('peca.obj', 'v 0 0 0'), 'O modelo deve estar no formato STL ou 3MF.'],
    'zip bomb' => [fn () => ArquivosDeTeste::zipBomb3mf(), 'O 3MF excede os limites de descompactação permitidos.'],
    'XXE' => [fn () => ArquivosDeTeste::arquivo3mf('<!DOCTYPE m [<!ENTITY x SYSTEM "file:///etc/passwd">]><model>&x;</model>'), 'O 3MF contém declarações XML não permitidas.'],
    'zip que não é 3MF' => [fn () => UploadedFile::fake()->createWithContent('peca.3mf', 'PK nada'), 'O arquivo 3MF não é um pacote ZIP válido.'],
]);

it('só o autor (ou moderador) envia arquivos ao projeto', function () {
    $projeto = Projeto::factory()->create();
    Sanctum::actingAs(Usuario::factory()->create());

    $this->post("/api/projeto/{$projeto->id}/anexos", ['tipo' => 'modelo', 'arquivo' => ArquivosDeTeste::stlAscii()], ['Accept' => 'application/json'])
        ->assertForbidden();
});

it('reencoda imagens em WebP, removendo metadados', function () {
    $projeto = Projeto::factory()->create();
    Sanctum::actingAs($projeto->usuario);

    $this->post("/api/projeto/{$projeto->id}/anexos", ['tipo' => 'imagem', 'arquivo' => UploadedFile::fake()->image('foto.jpg', 800, 600)], ['Accept' => 'application/json'])
        ->assertCreated()
        ->assertJsonPath('mime', 'image/webp')
        ->assertJsonPath('nome_arquivo', 'foto.webp');
});

it('arquivo infectado é apagado e fica indisponível; sem antivírus fica pendente', function () {
    $projeto = Projeto::factory()->create();
    Sanctum::actingAs($projeto->usuario);

    antivirusRespondendo(AntivirusScanner::INFECTADO);
    $infectado = $this->post("/api/projeto/{$projeto->id}/anexos", ['tipo' => 'modelo', 'arquivo' => ArquivosDeTeste::stlBinario()], ['Accept' => 'application/json'])
        ->assertCreated()
        ->assertJsonPath('status_verificacao', 'rejeitado');
    Storage::disk('local')->assertMissing(AnexoDocumento::find($infectado->json('id'))->url_arquivo);
    $this->getJson("/api/anexo/{$infectado->json('id')}/link")->assertForbidden();

    antivirusRespondendo(AntivirusScanner::INDISPONIVEL);
    $this->post("/api/projeto/{$projeto->id}/anexos", ['tipo' => 'modelo', 'arquivo' => ArquivosDeTeste::stlAscii()], ['Accept' => 'application/json'])
        ->assertJsonPath('status_verificacao', 'pendente');
});

it('download só por link temporário assinado e respeitando a visibilidade do projeto', function () {
    antivirusRespondendo(AntivirusScanner::LIMPO);
    $projeto = Projeto::factory()->create();
    Sanctum::actingAs($projeto->usuario);
    $id = $this->post("/api/projeto/{$projeto->id}/anexos", ['tipo' => 'modelo', 'arquivo' => ArquivosDeTeste::stlBinario()], ['Accept' => 'application/json'])->json('id');

    // Sem assinatura, nada feito.
    $this->get("/api/anexo/{$id}/arquivo")->assertForbidden();

    // Projeto voltou para revisão: visitante não obtém o link; o autor obtém.
    $this->app['auth']->forgetGuards();
    $this->getJson("/api/anexo/{$id}/link")->assertForbidden();

    Sanctum::actingAs($projeto->usuario);
    $url = $this->getJson("/api/anexo/{$id}/link")->assertOk()->json('url');

    $this->get($url)
        ->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertDownload('cubo.stl');
});

it('limita a quantidade de modelos por projeto', function () {
    $projeto = Projeto::factory()->create();
    Sanctum::actingAs($projeto->usuario);

    foreach (range(1, 5) as $i) {
        $this->post("/api/projeto/{$projeto->id}/anexos", ['tipo' => 'modelo', 'arquivo' => ArquivosDeTeste::stlAscii("m{$i}.stl")], ['Accept' => 'application/json'])->assertCreated();
    }

    $this->post("/api/projeto/{$projeto->id}/anexos", ['tipo' => 'modelo', 'arquivo' => ArquivosDeTeste::stlAscii()], ['Accept' => 'application/json'])
        ->assertStatus(422);
});

it('o autor remove o próprio anexo e o arquivo sai do disco', function () {
    $projeto = Projeto::factory()->create();
    Sanctum::actingAs($projeto->usuario);
    $id = $this->post("/api/projeto/{$projeto->id}/anexos", ['tipo' => 'modelo', 'arquivo' => ArquivosDeTeste::stlAscii()], ['Accept' => 'application/json'])->json('id');
    $caminho = AnexoDocumento::find($id)->url_arquivo;

    Sanctum::actingAs(Usuario::factory()->create());
    $this->deleteJson("/api/anexo/{$id}")->assertForbidden();

    Sanctum::actingAs($projeto->usuario);
    $this->deleteJson("/api/anexo/{$id}")->assertNoContent();
    Storage::disk('local')->assertMissing($caminho);
});
