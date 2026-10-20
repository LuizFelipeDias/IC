<?php

use App\Enums\AcaoPontuavel;
use App\Models\Chamado;
use App\Models\Projeto;
use App\Models\Usuario;
use App\Services\GamificacaoService;
use Laravel\Sanctum\Sanctum;

it('concluir chamado dá pontos e o selo de primeiro atendimento, uma única vez', function () {
    $chamado = Chamado::factory()->emAtendimento()->create();
    $prestador = $chamado->prestador;
    Sanctum::actingAs($prestador);

    $this->postJson("/api/chamado/{$chamado->id}/concluir")->assertOk();
    app(GamificacaoService::class)
        ->conceder($prestador, AcaoPontuavel::ChamadoConcluido, $chamado);

    expect($prestador->fresh()->pontos_total)->toBe(50)
        ->and($prestador->selos()->pluck('slug')->all())->toBe(['primeiro-atendimento']);
});

it('projeto aprovado pontua o autor', function () {
    $projeto = Projeto::factory()->emRevisao()->create();
    Sanctum::actingAs(Usuario::factory()->moderador()->create());

    $this->postJson("/api/projeto/{$projeto->id}/moderacao", ['decisao' => 'aprovar'])->assertOk();

    expect($projeto->usuario->fresh()->pontos_total)->toBe(20);
});

it('ranking público ordena por pontos e filtra por tipo', function () {
    Usuario::factory()->prestador()->create(['nome' => 'Maker A', 'pontos_total' => 120]);
    Usuario::factory()->laboratorio()->create(['nome' => 'Lab B', 'pontos_total' => 300]);
    Usuario::factory()->create(['pontos_total' => 0]);

    $this->getJson('/api/ranking')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.nome', 'Lab B')
        ->assertJsonPath('data.0.posicao', 1)
        ->assertJsonMissingPath('data.0.email');

    $this->getJson('/api/ranking?tipo=pessoa_fisica')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.nome', 'Maker A');
});
