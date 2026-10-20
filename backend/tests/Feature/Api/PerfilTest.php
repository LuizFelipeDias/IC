<?php

use App\Models\Usuario;
use Laravel\Sanctum\Sanctum;

function cadastroPessoaJuridica(string $tipo, array $extra = []): array
{
    return array_merge([
        'nome' => 'Instituição Teste',
        'email' => "{$tipo}@example.com",
        'telefone' => '(42) 3220-0000',
        'senha' => 'Senha@123',
        'tipo_usuario' => $tipo,
        'cnpj' => '12.345.678/0001-90',
    ], $extra);
}

it('cadastra escola exigindo o código INEP e deriva os booleanos do banco', function () {
    $this->postJson('/api/usuario', cadastroPessoaJuridica('escola'))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('codigo_inep');

    $this->postJson('/api/usuario', cadastroPessoaJuridica('escola', ['codigo_inep' => '41000001']))
        ->assertCreated()
        ->assertJsonPath('usuario.tipo_usuario', 'escola')
        ->assertJsonPath('usuario.empresa', true)
        ->assertJsonPath('usuario.perfis.solicitante', true)
        ->assertJsonPath('usuario.perfis.prestador', false);
});

it('laboratório é prestador e contratante, mas não solicita chamados', function () {
    $this->postJson('/api/usuario', cadastroPessoaJuridica('laboratorio'))
        ->assertCreated()
        ->assertJsonPath('usuario.perfis.prestador', true)
        ->assertJsonPath('usuario.perfis.contratante', true)
        ->assertJsonPath('usuario.perfis.solicitante', false)
        ->assertJsonPath('usuario.perfis.candidato', false);
});

it('só pessoa física pode se declarar maker/voluntário', function () {
    $this->postJson('/api/usuario', cadastroPessoaJuridica('empresa', ['prestador_servico' => true]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('prestador_servico');

    $this->postJson('/api/usuario', [
        'nome' => 'Maker', 'email' => 'maker@example.com', 'telefone' => '(42) 99999-0000', 'senha' => 'Senha@123',
        'tipo_usuario' => 'pessoa_fisica', 'cpf' => '111.222.333-44', 'sexo' => true, 'profissao' => 'Maker',
        'prestador_servico' => true,
    ])
        ->assertCreated()
        ->assertJsonPath('usuario.perfis.prestador', true)
        ->assertJsonPath('usuario.perfis.candidato', true);
});

it('não permite trocar o tipo de usuário nem promover a si mesmo a moderador', function () {
    Sanctum::actingAs($usuario = Usuario::factory()->create());

    $this->patchJson('/api/usuario/me', ['tipo_usuario' => 'empresa'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('tipo_usuario');

    $this->patchJson('/api/usuario/me', ['papel' => 'admin'])->assertOk();

    expect($usuario->fresh()->ehModerador())->toBeFalse();
});

it('pessoa física pode entrar e sair do programa de voluntários', function () {
    Sanctum::actingAs(Usuario::factory()->create());

    $this->patchJson('/api/usuario/me', ['prestador_servico' => true])
        ->assertOk()
        ->assertJsonPath('perfis.prestador', true);
});
