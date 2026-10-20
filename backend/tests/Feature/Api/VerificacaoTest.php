<?php

use App\Contracts\ConsultaCnpj;
use App\Models\Usuario;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

it('rejeita CPF e CNPJ com dígito verificador inválido e normaliza o formato', function () {
    $base = ['nome' => 'Teste', 'email' => 'a@example.com', 'telefone' => '42999990000', 'senha' => 'Senha@123'];

    $this->postJson('/api/usuario', [...$base, 'tipo_usuario' => 'pessoa_fisica', 'cpf' => '529.982.247-24', 'sexo' => true, 'profissao' => 'Maker'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.cpf.0', 'O CPF informado não é válido.');

    $this->postJson('/api/usuario', [...$base, 'tipo_usuario' => 'empresa', 'cnpj' => '11222333000180'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.cnpj.0', 'O CNPJ informado não é válido.');

    $this->postJson('/api/usuario', [...$base, 'tipo_usuario' => 'empresa', 'cnpj' => '11222333000181'])
        ->assertCreated()
        ->assertJsonPath('usuario.cnpj', '11.222.333/0001-81');

    // O mesmo CNPJ com máscara é reconhecido como duplicado.
    $this->postJson('/api/usuario', [...$base, 'email' => 'b@example.com', 'tipo_usuario' => 'empresa', 'cnpj' => '11.222.333/0001-81'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('cnpj');
});

it('mensagens de validação vêm em português', function () {
    $this->postJson('/api/usuario', [])
        ->assertUnprocessable()
        ->assertJsonPath('errors.nome.0', 'O campo nome é obrigatório.')
        ->assertJsonPath('errors.email.0', 'O campo e-mail é obrigatório.');

    $this->getJson('/api/usuario/me')->assertUnauthorized()->assertJsonPath('message', 'Faça login para continuar.');
    $this->getJson('/api/vaga/999999')->assertNotFound()->assertJsonPath('message', 'Registro não encontrado.');
});

it('instituição pendente não usa perfis institucionais até ser aprovada', function () {
    $empresa = Usuario::factory()->empresa()->pendente()->create();
    Sanctum::actingAs($empresa);

    $this->postJson('/api/vaga', ['titulo' => 'Vaga', 'texto' => 'Texto'])->assertForbidden();
    $this->postJson('/api/chamado', [])->assertForbidden();

    Sanctum::actingAs(Usuario::factory()->moderador()->create());
    $this->getJson('/api/moderacao/instituicoes')->assertOk()->assertJsonPath('data.0.id', $empresa->id);
    $this->postJson("/api/moderacao/instituicoes/{$empresa->id}/verificacao", ['decisao' => 'aprovar'])
        ->assertOk()
        ->assertJsonPath('verificacao_status', 'verificado')
        ->assertJsonPath('perfis.contratante', true);

    Sanctum::actingAs($empresa->fresh());
    $this->postJson('/api/vaga', ['titulo' => 'Vaga', 'texto' => 'Texto'])->assertCreated();
});

it('rejeição exige motivo e quem não é moderador não decide', function () {
    $escola = Usuario::factory()->escola()->pendente()->create();

    Sanctum::actingAs(Usuario::factory()->empresa()->create());
    $this->postJson("/api/moderacao/instituicoes/{$escola->id}/verificacao", ['decisao' => 'aprovar'])->assertForbidden();

    Sanctum::actingAs(Usuario::factory()->moderador()->create());
    $this->postJson("/api/moderacao/instituicoes/{$escola->id}/verificacao", ['decisao' => 'rejeitar'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('motivo');
    $this->postJson("/api/moderacao/instituicoes/{$escola->id}/verificacao", ['decisao' => 'rejeitar', 'motivo' => 'INEP não confere.'])
        ->assertOk()
        ->assertJsonPath('verificacao_status', 'rejeitado');
});

it('trocar o CNPJ devolve a instituição para a fila de verificação', function () {
    Sanctum::actingAs($empresa = Usuario::factory()->empresa()->create());

    $this->patchJson('/api/usuario/me', ['cnpj' => '11.222.333/0001-81'])
        ->assertOk()
        ->assertJsonPath('verificacao_status', 'pendente')
        ->assertJsonPath('perfis.contratante', false);
});

it('consulta a situação do CNPJ na BrasilAPI para o moderador', function () {
    Http::fake([
        'brasilapi.com.br/*' => Http::response([
            'razao_social' => 'EMPRESA TESTE LTDA',
            'descricao_situacao_cadastral' => 'ATIVA',
            'municipio' => 'PONTA GROSSA',
            'uf' => 'PR',
            'data_inicio_atividade' => '2010-01-01',
        ]),
    ]);

    $empresa = Usuario::factory()->empresa()->pendente()->create(['cnpj' => '11.222.333/0001-81']);
    Sanctum::actingAs(Usuario::factory()->moderador()->create());

    $this->getJson("/api/moderacao/instituicoes/{$empresa->id}/cnpj")
        ->assertOk()
        ->assertJsonPath('razao_social', 'EMPRESA TESTE LTDA')
        ->assertJsonPath('situacao', 'ATIVA');

    Http::assertSent(fn ($request) => str_ends_with($request->url(), '/11222333000181'));
});

it('informa indisponibilidade quando a consulta de CNPJ falha', function () {
    $this->app->bind(ConsultaCnpj::class, fn () => new class implements ConsultaCnpj
    {
        public function consultar(string $cnpj): ?array
        {
            return null;
        }
    });

    $empresa = Usuario::factory()->empresa()->pendente()->create();
    Sanctum::actingAs(Usuario::factory()->moderador()->create());

    $this->getJson("/api/moderacao/instituicoes/{$empresa->id}/cnpj")->assertStatus(502);
});
