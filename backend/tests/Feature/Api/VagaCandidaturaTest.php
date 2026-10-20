<?php

use App\Models\Candidatura;
use App\Models\Usuario;
use App\Models\Vaga;
use Laravel\Sanctum\Sanctum;

it('lista vagas publicamente com paginação', function () {
    Vaga::factory(3)->create();

    $this->getJson('/api/vaga')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure(['data', 'links', 'meta']);
});

it('exige autenticação para publicar vaga', function () {
    $this->postJson('/api/vaga', ['titulo' => 'X', 'texto' => 'Y'])->assertUnauthorized();
});

it('publica a vaga em nome do usuário do token, ignorando id_usuario do corpo', function () {
    $outro = Usuario::factory()->create();
    Sanctum::actingAs($empresa = Usuario::factory()->empresa()->create());

    $this->postJson('/api/vaga', ['titulo' => 'Modelador 3D', 'texto' => 'Descrição', 'id_usuario' => $outro->id])
        ->assertCreated()
        ->assertJsonPath('id_usuario', $empresa->id);
});

it('lista apenas as vagas do próprio usuário em /vaga/minhas', function () {
    $empresa = Usuario::factory()->empresa()->create();
    Vaga::factory(2)->for($empresa, 'usuario')->create();
    Vaga::factory(3)->create();

    Sanctum::actingAs($empresa);

    $this->getJson('/api/vaga/minhas')->assertOk()->assertJsonCount(2, 'data');
});

it('impede alterar ou excluir vaga de outro usuário', function () {
    $vaga = Vaga::factory()->create();
    Sanctum::actingAs(Usuario::factory()->create());

    $this->putJson("/api/vaga/{$vaga->id}", ['titulo' => 'Invadida'])->assertForbidden();
    $this->deleteJson("/api/vaga/{$vaga->id}")->assertForbidden();
});

it('o dono exclui a própria vaga', function () {
    $vaga = Vaga::factory()->create();
    Sanctum::actingAs($vaga->usuario);

    $this->deleteJson("/api/vaga/{$vaga->id}")->assertNoContent();
    expect(Vaga::find($vaga->id))->toBeNull();
});

it('candidatura não duplica e começa em análise', function () {
    $vaga = Vaga::factory()->create();
    Sanctum::actingAs(Usuario::factory()->create());

    $this->postJson('/api/candidatura', ['id_vaga' => $vaga->id])
        ->assertCreated()
        ->assertJsonPath('status', 'Em análise');

    $this->postJson('/api/candidatura', ['id_vaga' => $vaga->id])->assertOk();

    expect(Candidatura::count())->toBe(1);
});

it('só o dono da vaga muda o status e vê os candidatos', function () {
    $candidatura = Candidatura::factory()->create();
    $donoDaVaga = $candidatura->vaga->usuario;

    Sanctum::actingAs($candidatura->usuario);
    $this->patchJson("/api/candidatura/{$candidatura->id}", ['status' => 'Aprovada'])->assertForbidden();
    $this->getJson("/api/vaga/{$candidatura->id_vaga}/candidaturas")->assertForbidden();

    Sanctum::actingAs($donoDaVaga);
    $this->patchJson("/api/candidatura/{$candidatura->id}", ['status' => 'Aprovada'])
        ->assertOk()
        ->assertJsonPath('status', 'Aprovada');
    $this->getJson("/api/vaga/{$candidatura->id_vaga}/candidaturas")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('só o candidato desiste da própria candidatura', function () {
    $candidatura = Candidatura::factory()->create();

    Sanctum::actingAs($candidatura->vaga->usuario);
    $this->deleteJson("/api/candidatura/{$candidatura->id}")->assertForbidden();

    Sanctum::actingAs($candidatura->usuario);
    $this->deleteJson("/api/candidatura/{$candidatura->id}")->assertNoContent();
});

it('só pessoa jurídica (empresa, escola, laboratório) publica vagas', function () {
    Sanctum::actingAs(Usuario::factory()->create());
    $this->postJson('/api/vaga', ['titulo' => 'Vaga', 'texto' => 'Texto'])->assertForbidden();
    $this->getJson('/api/vaga/minhas')->assertForbidden();

    foreach (['empresa', 'escola', 'laboratorio'] as $tipo) {
        Sanctum::actingAs(Usuario::factory()->{$tipo}()->create());
        $this->postJson('/api/vaga', ['titulo' => "Vaga {$tipo}", 'texto' => 'Texto'])->assertCreated();
    }
});

it('só pessoa física se candidata', function () {
    $vaga = Vaga::factory()->create();

    Sanctum::actingAs(Usuario::factory()->empresa()->create());
    $this->postJson('/api/candidatura', ['id_vaga' => $vaga->id])->assertForbidden();
    $this->getJson('/api/candidatura')->assertForbidden();

    Sanctum::actingAs(Usuario::factory()->prestador()->create());
    $this->postJson('/api/candidatura', ['id_vaga' => $vaga->id])->assertCreated();
});
