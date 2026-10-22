<?php

use App\Models\LaudoQualidade;
use App\Models\LoteFilamento;
use App\Models\SolicitacaoColeta;

it('mostra a origem, a linha do tempo e o laudo do lote sem dados pessoais', function () {
    $lote = LoteFilamento::factory()->create();
    $coletas = SolicitacaoColeta::factory(2)->concluida()->create();
    $lote->coletas()->attach([$coletas[0]->id => ['peso_g' => 1500], $coletas[1]->id => ['peso_g' => 2500]]);
    $lote->eventos()->createMany([
        ['tipo' => 'triturado', 'descricao' => 'Material triturado', 'ocorrido_em' => now()->subDays(3)],
        ['tipo' => 'extrudado', 'descricao' => 'Filamento extrudado', 'ocorrido_em' => now()->subDay()],
    ]);
    LaudoQualidade::factory()->for($lote, 'lote')->create();

    $resposta = $this->getJson("/api/rastreio/{$lote->codigo}")
        ->assertOk()
        ->assertJsonPath('codigo', $lote->codigo)
        ->assertJsonPath('polimero.sigla', 'PLA')
        ->assertJsonPath('origem.doacoes', 2)
        ->assertJsonPath('origem.peso_reciclado_g', 4000)
        ->assertJsonPath('eventos.0.tipo', 'triturado')
        ->assertJsonPath('laudos.0.resultado', 'aprovado');

    expect($resposta->getContent())
        ->not->toContain($coletas[0]->doacao->doador->email)
        ->not->toContain($coletas[0]->doacao->doador->nome);
});

it('gera código ULID não sequencial e responde 404 para código inexistente', function () {
    $lote = LoteFilamento::factory()->create();

    expect($lote->codigo)->toHaveLength(26);
    $this->getJson('/api/rastreio/'.$lote->id)->assertNotFound();
    $this->getJson('/api/rastreio/01JZZZZZZZZZZZZZZZZZZZZZZZ')->assertNotFound();
});
