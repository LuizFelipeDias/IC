<?php

use App\Models\Noticia;
use App\Models\Projeto;
use App\Models\Usuario;
use App\Models\Vaga;
use Database\Factories\UsuarioFactory;
use Laravel\Sanctum\Sanctum;

it('não expõe a listagem de usuários', function () {
    Sanctum::actingAs(Usuario::factory()->create());

    $this->getJson('/api/usuario')->assertMethodNotAllowed();
});

it('perfil de outro usuário não mostra documentos nem contato', function () {
    $outro = Usuario::factory()->create();
    Sanctum::actingAs(Usuario::factory()->create());

    $this->getJson("/api/usuario/{$outro->id}")
        ->assertOk()
        ->assertJsonMissingPath('cpf')
        ->assertJsonMissingPath('email')
        ->assertJsonMissingPath('telefone');
});

it('não permite alterar nem excluir outra conta', function () {
    $outro = Usuario::factory()->create();

    $this->putJson("/api/usuario/{$outro->id}", ['email' => 'hacker@example.com'])->assertMethodNotAllowed();
    $this->deleteJson("/api/usuario/{$outro->id}")->assertMethodNotAllowed();

    Sanctum::actingAs(Usuario::factory()->create());
    $this->deleteJson("/api/usuario/{$outro->id}")->assertMethodNotAllowed();

    expect($outro->fresh()->email)->not->toBe('hacker@example.com');
});

it('atualiza os próprios dados e exige a senha atual para trocar a senha', function () {
    Sanctum::actingAs($usuario = Usuario::factory()->create());

    $this->patchJson('/api/usuario/me', ['nome' => 'Novo Nome'])
        ->assertOk()
        ->assertJsonPath('nome', 'Novo Nome');

    $this->patchJson('/api/usuario/me', ['senha' => 'Nova@Senha1'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('senha_atual');

    $this->patchJson('/api/usuario/me', ['senha' => 'Nova@Senha1', 'senha_atual' => UsuarioFactory::SENHA])
        ->assertOk();
});

it('não permite trocar o próprio perfil para empresa depois do cadastro', function () {
    Sanctum::actingAs($usuario = Usuario::factory()->create());

    $this->patchJson('/api/usuario/me', ['empresa' => true])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('empresa');

    expect($usuario->fresh()->empresa)->toBeFalse();
});

it('exclui a própria conta', function () {
    Sanctum::actingAs($usuario = Usuario::factory()->create());

    $this->deleteJson('/api/usuario/me')->assertNoContent();

    expect(Usuario::find($usuario->id))->toBeNull();
});

it('exclui a conta de quem publicou: vagas saem junto, notícias e projetos ficam sem autor', function () {
    $empresa = Usuario::factory()->empresa()->create();
    $vaga = Vaga::factory()->for($empresa, 'usuario')->create();
    $noticia = Noticia::factory()->for($empresa, 'usuario')->create();
    $projeto = Projeto::factory()->for($empresa, 'usuario')->create();

    Sanctum::actingAs($empresa);
    $this->deleteJson('/api/usuario/me')->assertNoContent();

    expect(Vaga::find($vaga->id))->toBeNull()
        ->and($noticia->fresh()->id_usuario)->toBeNull()
        ->and($projeto->fresh()->id_usuario)->toBeNull();
});
