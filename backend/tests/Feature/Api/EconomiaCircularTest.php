<?php

use App\Contracts\AntivirusScanner;
use App\Models\Doacao;
use App\Models\LoteFilamento;
use App\Models\Polimero;
use App\Models\SolicitacaoColeta;
use App\Models\Usuario;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Support\ArquivosDeTeste;

beforeEach(function () {
    Storage::fake('local');
});

function idPolimero(string $sigla = 'PLA'): int
{
    return Polimero::where('sigla', $sigla)->value('id');
}

it('percorre o ciclo doação -> coleta -> lote -> laudo -> rastreio público', function () {
    $maker = Usuario::factory()->prestador()->create();
    $laboratorio = Usuario::factory()->laboratorio()->create();

    // 1. O maker doa e anexa uma foto.
    Sanctum::actingAs($maker);
    $doacao = $this->postJson('/api/doacao', [
        'id_polimero' => idPolimero(), 'tipo' => 'resto_filamento', 'titulo' => 'Sobras de PLA branco',
        'peso_estimado_g' => 1200, 'cidade' => 'Ponta Grossa', 'uf' => 'pr',
    ])->assertCreated()->assertJsonPath('status', 'disponivel')->assertJsonPath('uf', 'PR')->json();

    $this->post("/api/doacao/{$doacao['id']}/fotos", ['arquivo' => UploadedFile::fake()->image('sobras.jpg')], ['Accept' => 'application/json'])
        ->assertCreated();

    // 2. O laboratório solicita a coleta; o maker aceita com data.
    Sanctum::actingAs($laboratorio);
    $coleta = $this->postJson("/api/doacao/{$doacao['id']}/coletas", ['modalidade' => 'coleta'])
        ->assertCreated()->assertJsonPath('status', 'pendente')->json();

    Sanctum::actingAs($maker);
    $this->postJson("/api/coleta/{$coleta['id']}/aceitar", ['agendado_para' => now()->addDays(2)->toIso8601String()])
        ->assertOk()->assertJsonPath('status', 'agendada')
        ->assertJsonPath('contato.laboratorio.email', $laboratorio->email);
    expect(Doacao::find($doacao['id'])->status->value)->toBe('reservada');

    // 3. O laboratório conclui com o peso real; os dois pontuam.
    Sanctum::actingAs($laboratorio);
    $this->postJson("/api/coleta/{$coleta['id']}/concluir", ['peso_recebido_g' => 1100])
        ->assertOk()->assertJsonPath('status', 'concluida');
    expect($laboratorio->fresh()->pontos_total)->toBe(30)
        ->and($maker->fresh()->pontos_total)->toBe(15)
        ->and(Doacao::find($doacao['id'])->status->value)->toBe('coletada');

    // 4. Lote formado a partir da coleta; eventos da produção.
    $lote = $this->postJson('/api/lote', [
        'id_polimero' => idPolimero(), 'diametro_nominal_mm' => 1.75, 'cor' => 'branco',
        'coletas' => [['id' => $coleta['id'], 'peso_g' => 1000]],
    ])->assertCreated()->assertJsonPath('peso_entrada_g', 1000)->assertJsonPath('eventos.0.tipo', 'coletado')->json();

    $this->postJson("/api/lote/{$lote['id']}/eventos", ['tipo' => 'extrudado', 'descricao' => 'Extrusão a 200 °C'])->assertCreated();
    $this->patchJson("/api/lote/{$lote['id']}", ['peso_saida_g' => 920, 'status' => 'aguardando_laudo', 'produzido_em' => now()->toIso8601String()])
        ->assertOk()->assertJsonPath('status', 'aguardando_laudo');

    // 5. Laudo com PDF aprova o lote.
    app()->bind(AntivirusScanner::class, fn () => new class implements AntivirusScanner
    {
        public function verificar(string $caminhoAbsoluto): string
        {
            return self::LIMPO;
        }
    });
    $laudo = $this->post("/api/lote/{$lote['id']}/laudos", [
        'arquivo' => ArquivosDeTeste::pdf(), 'resultado' => 'aprovado', 'diametro_medio_mm' => 1.748,
        'tolerancia_mm' => 0.03, 'resistencia_tracao_mpa' => 47.2, 'temp_impressao_min' => 195, 'temp_impressao_max' => 215,
    ], ['Accept' => 'application/json'])->assertCreated()->assertJsonPath('status_lote', 'aprovado')->json();

    // 6. Qualquer pessoa consulta o QR Code e baixa o PDF do laudo.
    $this->app['auth']->forgetGuards();
    $rastreio = $this->getJson("/api/rastreio/{$lote['codigo']}")
        ->assertOk()
        ->assertJsonPath('origem.peso_reciclado_g', 1000)
        ->assertJsonPath('origem.doacoes', 1)
        ->assertJsonPath('laudos.0.id_anexo', $laudo['id_anexo']);
    expect(collect($rastreio->json('eventos'))->pluck('tipo')->all())->toBe(['coletado', 'extrudado', 'laudo_emitido'])
        ->and($rastreio->getContent())->not->toContain($maker->email);

    $url = $this->getJson("/api/anexo/{$laudo['id_anexo']}/link")->assertOk()->json('url');
    $this->get($url)->assertOk()->assertDownload('laudo.pdf');
});

it('só laboratório verificado solicita coletas e uma por vez por doação', function () {
    $doacao = Doacao::factory()->create();

    Sanctum::actingAs(Usuario::factory()->prestador()->create());
    $this->postJson("/api/doacao/{$doacao->id}/coletas", ['modalidade' => 'coleta'])->assertForbidden();

    Sanctum::actingAs(Usuario::factory()->laboratorio()->pendente()->create());
    $this->postJson("/api/doacao/{$doacao->id}/coletas", ['modalidade' => 'coleta'])->assertForbidden();

    Sanctum::actingAs(Usuario::factory()->laboratorio()->create());
    $this->postJson("/api/doacao/{$doacao->id}/coletas", ['modalidade' => 'entrega'])->assertCreated();

    Sanctum::actingAs(Usuario::factory()->laboratorio()->create());
    $this->postJson("/api/doacao/{$doacao->id}/coletas", ['modalidade' => 'coleta'])
        ->assertStatus(409)
        ->assertJsonPath('message', 'Esta doação já tem uma solicitação em andamento.');
});

it('recusa e cancelamento devolvem a doação ao mural', function () {
    $coleta = SolicitacaoColeta::factory()->create();
    $doador = $coleta->doacao->doador;

    Sanctum::actingAs($coleta->laboratorio);
    $this->postJson("/api/coleta/{$coleta->id}/aceitar")->assertForbidden();

    Sanctum::actingAs($doador);
    $this->postJson("/api/coleta/{$coleta->id}/aceitar")->assertOk()->assertJsonPath('status', 'aceita');

    Sanctum::actingAs($coleta->laboratorio);
    $this->postJson("/api/coleta/{$coleta->id}/cancelar")->assertOk()->assertJsonPath('status', 'cancelada');
    expect($coleta->doacao->fresh()->status->value)->toBe('disponivel');

    $outra = SolicitacaoColeta::factory()->create();
    Sanctum::actingAs($outra->doacao->doador);
    $this->postJson("/api/coleta/{$outra->id}/recusar", ['motivo' => 'Já doado a outro grupo.'])
        ->assertOk()->assertJsonPath('status', 'recusada');
});

it('doador edita só enquanto disponível e lista as próprias doações', function () {
    $doacao = Doacao::factory()->create();
    Sanctum::actingAs(Usuario::factory()->create());
    $this->patchJson("/api/doacao/{$doacao->id}", ['titulo' => 'X'])->assertForbidden();

    Sanctum::actingAs($doacao->doador);
    $this->patchJson("/api/doacao/{$doacao->id}", ['titulo' => 'Novo título'])->assertOk();
    $this->getJson('/api/doacao/minhas')->assertOk()->assertJsonCount(1, 'data');

    $doacao->forceFill(['status' => 'reservada'])->save();
    $this->deleteJson("/api/doacao/{$doacao->id}")->assertForbidden();
});

it('lote só aceita coletas próprias, concluídas, do mesmo polímero e com saldo', function () {
    $laboratorio = Usuario::factory()->laboratorio()->create();
    $coleta = SolicitacaoColeta::factory()->concluida()->for($laboratorio, 'laboratorio')->create(['peso_recebido_g' => 500]);
    $deOutro = SolicitacaoColeta::factory()->concluida()->create();
    $pendente = SolicitacaoColeta::factory()->for($laboratorio, 'laboratorio')->create();

    Sanctum::actingAs($laboratorio);
    $base = ['id_polimero' => idPolimero(), 'diametro_nominal_mm' => 1.75];

    $this->postJson('/api/lote', [...$base, 'coletas' => [['id' => $deOutro->id, 'peso_g' => 100]]])->assertJsonValidationErrors('coletas.0.id');
    $this->postJson('/api/lote', [...$base, 'coletas' => [['id' => $pendente->id, 'peso_g' => 100]]])->assertJsonValidationErrors('coletas.0.id');
    $this->postJson('/api/lote', [...$base, 'id_polimero' => idPolimero('ABS'), 'coletas' => [['id' => $coleta->id, 'peso_g' => 100]]])->assertJsonValidationErrors('coletas.0.id');
    $this->postJson('/api/lote', [...$base, 'coletas' => [['id' => $coleta->id, 'peso_g' => 300]]])->assertCreated();
    $this->postJson('/api/lote', [...$base, 'coletas' => [['id' => $coleta->id, 'peso_g' => 300]]])
        ->assertJsonPath('errors', ['coletas.0.peso_g' => ["A coleta #{$coleta->id} tem apenas 200 g disponíveis."]]);
});

it('laudo exige PDF seguro e só o laboratório do lote o emite', function () {
    $lote = LoteFilamento::factory()->create(['status' => 'aguardando_laudo']);
    $dados = ['resultado' => 'reprovado', 'diametro_medio_mm' => 1.9, 'tolerancia_mm' => 0.2];

    Sanctum::actingAs(Usuario::factory()->laboratorio()->create());
    $this->post("/api/lote/{$lote->id}/laudos", [...$dados, 'arquivo' => ArquivosDeTeste::pdf()], ['Accept' => 'application/json'])->assertForbidden();

    Sanctum::actingAs($lote->laboratorio);
    $this->post("/api/lote/{$lote->id}/laudos", [...$dados, 'arquivo' => ArquivosDeTeste::pdf('/OpenAction << /S /JavaScript /JS (app.alert(1)) >>')], ['Accept' => 'application/json'])
        ->assertUnprocessable()->assertJsonValidationErrors('arquivo');
    $this->post("/api/lote/{$lote->id}/laudos", [...$dados, 'arquivo' => UploadedFile::fake()->createWithContent('laudo.pdf', 'não sou pdf')], ['Accept' => 'application/json'])
        ->assertUnprocessable()->assertJsonPath('errors.arquivo.0', 'O arquivo não é um PDF válido.');
    $this->post("/api/lote/{$lote->id}/laudos", [...$dados, 'arquivo' => ArquivosDeTeste::pdf()], ['Accept' => 'application/json'])
        ->assertCreated()->assertJsonPath('status_lote', 'reprovado');
});

it('catálogo de polímeros é público', function () {
    $this->getJson('/api/polimeros')->assertOk()->assertJsonFragment(['sigla' => 'PETG']);
});
