<?php

use App\Models\Usuario;
use Database\Factories\UsuarioFactory;
use Laravel\Sanctum\Sanctum;

function dadosCadastro(array $sobrescrever = []): array
{
    return array_merge([
        'nome' => 'Maria Maker',
        'email' => 'maria@example.com',
        'telefone' => '(42) 99999-0000',
        'senha' => 'Senha@123',
        'estudante' => true,
        'empresa' => false,
        'cpf' => '123.456.789-00',
    ], $sobrescrever);
}

it('cadastra o usuário e devolve token para auto-login', function () {
    $this->postJson('/api/usuario', dadosCadastro())
        ->assertCreated()
        ->assertJsonStructure(['message', 'token', 'usuario' => ['id', 'nome', 'email', 'tipo']])
        ->assertJsonMissingPath('usuario.senha');

    expect(Usuario::first()->senha)->not->toBe('Senha@123');
});

it('rejeita e-mail duplicado e senha fraca no cadastro', function () {
    Usuario::factory()->create(['email' => 'maria@example.com']);

    $this->postJson('/api/usuario', dadosCadastro(['senha' => '123']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'senha']);
});

it('faz login com credenciais válidas e recusa as inválidas', function () {
    $usuario = Usuario::factory()->create();

    $this->postJson('/api/login', ['email' => $usuario->email, 'senha' => UsuarioFactory::SENHA])
        ->assertOk()
        ->assertJsonStructure(['token', 'usuario']);

    $this->postJson('/api/login', ['email' => $usuario->email, 'senha' => 'errada'])
        ->assertUnauthorized()
        ->assertJsonPath('message', 'E-mail e/ou senha incorretos.');
});

it('limita tentativas de login por e-mail', function () {
    $usuario = Usuario::factory()->create();

    foreach (range(1, 5) as $tentativa) {
        $this->postJson('/api/login', ['email' => $usuario->email, 'senha' => 'errada'])->assertUnauthorized();
    }

    $this->postJson('/api/login', ['email' => $usuario->email, 'senha' => UsuarioFactory::SENHA])
        ->assertTooManyRequests();
});

it('revoga o token no logout', function () {
    $usuario = Usuario::factory()->create();
    $token = $usuario->createToken('teste')->plainTextToken;

    $this->withToken($token)->postJson('/api/logout')->assertNoContent();

    expect($usuario->tokens()->count())->toBe(0);
});

it('exige token em /usuario/me', function () {
    $this->getJson('/api/usuario/me')->assertUnauthorized();

    Sanctum::actingAs($usuario = Usuario::factory()->create());

    $this->getJson('/api/usuario/me')
        ->assertOk()
        ->assertJsonPath('id', $usuario->id)
        ->assertJsonPath('tipo', 'estudante');
});
