<?php

use App\Models\Chamado;
use App\Models\Curriculo;
use App\Models\Noticia;
use App\Models\Projeto;
use App\Models\Usuario;
use Laravel\Sanctum\Sanctum;

dataset('conteudos', [
    'noticia' => ['noticia', Noticia::class, ['titulo' => 'Nova', 'tema' => 'Reciclagem', 'texto' => 'Texto']],
    'projeto' => ['projeto', Projeto::class, ['titulo' => 'Novo', 'tema' => 'Saúde', 'texto' => 'Texto']],
    'chamado' => ['chamado', Chamado::class, ['titulo' => 'Ajuda', 'descricao' => 'Descrição', 'data_limite' => '2099-12-31']],
    'curriculo' => ['curriculo', Curriculo::class, ['cargo' => 'Modelador', 'texto' => 'Resumo']],
]);

it('exige autenticação para criar e excluir', function (string $rota, string $model, array $dados) {
    $existente = $model::factory()->create();

    $this->postJson("/api/{$rota}", $dados)->assertUnauthorized();
    $this->deleteJson("/api/{$rota}/{$existente->id}")->assertUnauthorized();

    expect($model::find($existente->id))->not->toBeNull();
})->with('conteudos');

it('cria em nome do usuário do token, ignorando id_usuario do corpo', function (string $rota, string $model, array $dados) {
    $outro = Usuario::factory()->create();
    Sanctum::actingAs($autor = Usuario::factory()->create());

    $this->postJson("/api/{$rota}", [...$dados, 'id_usuario' => $outro->id])
        ->assertCreated()
        ->assertJsonPath('id_usuario', $autor->id);
})->with('conteudos');

it('impede alterar ou excluir conteúdo de outro usuário', function (string $rota, string $model, array $dados) {
    $existente = $model::factory()->create();
    Sanctum::actingAs(Usuario::factory()->empresa()->create());

    $this->putJson("/api/{$rota}/{$existente->id}", $dados)->assertForbidden();
    $this->deleteJson("/api/{$rota}/{$existente->id}")->assertForbidden();
})->with('conteudos');

it('o autor exclui o próprio conteúdo', function (string $rota, string $model, array $dados) {
    $existente = $model::factory()->create();
    Sanctum::actingAs($existente->usuario);

    $this->deleteJson("/api/{$rota}/{$existente->id}")->assertNoContent();
    expect($model::find($existente->id))->toBeNull();
})->with('conteudos');

it('notícias e projetos são públicos para leitura; projeto não quebra mais', function () {
    Noticia::factory(2)->create();
    Projeto::factory(2)->create();

    $this->getJson('/api/noticia')->assertOk()->assertJsonCount(2, 'data');
    $this->getJson('/api/projeto')->assertOk()->assertJsonCount(2, 'data');
});

it('currículos de terceiros só são visíveis para empresas', function () {
    $curriculo = Curriculo::factory()->create();

    Sanctum::actingAs(Usuario::factory()->create());
    $this->getJson("/api/curriculo/{$curriculo->id}")->assertForbidden();
    $this->getJson('/api/curriculo')->assertOk()->assertJsonCount(0, 'data');

    Sanctum::actingAs(Usuario::factory()->empresa()->create());
    $this->getJson("/api/curriculo/{$curriculo->id}")->assertOk();
    $this->getJson('/api/curriculo')->assertOk()->assertJsonCount(1, 'data');
});
