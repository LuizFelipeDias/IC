<?php

use App\Models\Denuncia;
use App\Models\Moderacao;
use App\Models\Noticia;
use App\Models\Projeto;
use App\Models\Usuario;
use Laravel\Sanctum\Sanctum;

describe('notícias', function () {
    it('pessoa física não publica notícia; instituições e moderadores publicam', function () {
        $dados = ['titulo' => 'Reciclagem de PETG', 'tema' => 'Reciclagem', 'texto' => 'Texto'];

        Sanctum::actingAs(Usuario::factory()->prestador()->create());
        $this->postJson('/api/noticia', $dados)->assertForbidden();

        Sanctum::actingAs(Usuario::factory()->laboratorio()->create());
        $this->postJson('/api/noticia', $dados)->assertCreated()->assertJsonPath('status', 'em_revisao');

        Sanctum::actingAs(Usuario::factory()->moderador()->create());
        $this->postJson('/api/noticia', $dados)->assertCreated()->assertJsonPath('status', 'publicado');
    });

    it('o público só vê notícias aprovadas', function () {
        Noticia::factory(2)->create();
        $pendente = Noticia::factory()->emRevisao()->create();

        $this->getJson('/api/noticia')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson("/api/noticia/{$pendente->id}")->assertForbidden();

        Sanctum::actingAs(Usuario::factory()->create());
        $this->getJson("/api/noticia/{$pendente->id}")->assertForbidden();
    });

    it('autor acompanha as próprias notícias em revisão', function () {
        $pendente = Noticia::factory()->emRevisao()->create();
        Sanctum::actingAs($pendente->usuario);

        $this->getJson("/api/noticia/{$pendente->id}")->assertOk();
        $this->getJson('/api/noticia/minhas')->assertOk()->assertJsonCount(1, 'data');
    });

    it('edição do autor devolve a notícia para revisão', function () {
        $noticia = Noticia::factory()->create();
        Sanctum::actingAs($noticia->usuario);

        $this->patchJson("/api/noticia/{$noticia->id}", ['titulo' => 'Título corrigido'])
            ->assertOk()
            ->assertJsonPath('status', 'em_revisao');
    });
});

describe('moderação', function () {
    it('moderador aprova e rejeita com motivo, registrando a decisão', function () {
        $noticia = Noticia::factory()->emRevisao()->create();
        $projeto = Projeto::factory()->emRevisao()->create();
        Sanctum::actingAs(Usuario::factory()->moderador()->create());

        $this->postJson("/api/noticia/{$noticia->id}/moderacao", ['decisao' => 'aprovar'])
            ->assertOk()
            ->assertJsonPath('status', 'publicado');

        $this->postJson("/api/projeto/{$projeto->id}/moderacao", ['decisao' => 'rejeitar'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('motivo');

        $this->postJson("/api/projeto/{$projeto->id}/moderacao", ['decisao' => 'rejeitar', 'motivo' => 'Peça com risco de uso.'])
            ->assertOk()
            ->assertJsonPath('status', 'rejeitado')
            ->assertJsonPath('motivo_rejeicao', 'Peça com risco de uso.');

        expect(Moderacao::count())->toBe(2);
    });

    it('quem não é moderador não modera, e moderador não aprova o próprio conteúdo', function () {
        $projeto = Projeto::factory()->emRevisao()->create();

        Sanctum::actingAs(Usuario::factory()->empresa()->create());
        $this->postJson("/api/projeto/{$projeto->id}/moderacao", ['decisao' => 'aprovar'])->assertForbidden();

        $moderador = Usuario::factory()->moderador()->create();
        $proprio = Projeto::factory()->emRevisao()->for($moderador, 'usuario')->create();
        Sanctum::actingAs($moderador);
        $this->postJson("/api/projeto/{$proprio->id}/moderacao", ['decisao' => 'aprovar'])->assertForbidden();
    });
});

describe('repositório de projetos', function () {
    it('exige área e licença e filtra o catálogo por elas', function () {
        Sanctum::actingAs(Usuario::factory()->prestador()->create());

        $this->postJson('/api/projeto', ['titulo' => 'Prótese', 'texto' => 'STL em breve'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['area', 'licenca']);

        Projeto::factory()->create(['area' => 'saude']);
        Projeto::factory()->create(['area' => 'agro']);

        $this->getJson('/api/projeto?area=saude')->assertOk()->assertJsonCount(1, 'data');
    });
});

describe('denúncias', function () {
    it('denúncia procedente retira o projeto do catálogo', function () {
        $projeto = Projeto::factory()->create();

        Sanctum::actingAs(Usuario::factory()->create());
        $this->postJson('/api/denuncia', ['tipo' => 'projeto', 'id' => $projeto->id, 'motivo' => 'peca_perigosa'])
            ->assertCreated();
        $this->getJson('/api/denuncia')->assertForbidden();

        Sanctum::actingAs(Usuario::factory()->moderador()->create());
        $denuncia = Denuncia::first();
        $this->getJson('/api/denuncia')->assertOk()->assertJsonCount(1, 'data');
        $this->postJson("/api/denuncia/{$denuncia->id}/resolver", ['procedente' => true])
            ->assertOk()
            ->assertJsonPath('status', 'procedente');

        expect($projeto->fresh()->estaPublicado())->toBeFalse();
        $this->getJson('/api/projeto')->assertOk()->assertJsonCount(0, 'data');
    });

    it('não aceita denúncia de conteúdo que não está publicado', function () {
        $projeto = Projeto::factory()->emRevisao()->create();
        Sanctum::actingAs(Usuario::factory()->create());

        $this->postJson('/api/denuncia', ['tipo' => 'projeto', 'id' => $projeto->id, 'motivo' => 'spam'])->assertNotFound();
    });
});

describe('reações em notícias', function () {
    it('cada usuário tem uma reação por notícia, que pode ser trocada ou removida', function () {
        $noticia = Noticia::factory()->create();
        Sanctum::actingAs($usuario = Usuario::factory()->create());

        $this->putJson("/api/noticia/{$noticia->id}/reacao", ['tipo_reacao' => 'curtir', 'comentarios' => 'Ótimo!'])
            ->assertCreated();
        $this->putJson("/api/noticia/{$noticia->id}/reacao", ['tipo_reacao' => 'util'])
            ->assertOk()
            ->assertJsonPath('tipo_reacao', 'util');

        $this->getJson("/api/noticia/{$noticia->id}/reacoes")
            ->assertOk()
            ->assertJsonPath('totais.util', 1)
            ->assertJsonCount(1, 'reacoes.data');

        $this->deleteJson("/api/noticia/{$noticia->id}/reacao")->assertNoContent();
        expect($noticia->reacoes()->count())->toBe(0);
    });

    it('não aceita reação em notícia não publicada nem tipo desconhecido', function () {
        $pendente = Noticia::factory()->emRevisao()->create();
        $publicada = Noticia::factory()->create();
        Sanctum::actingAs(Usuario::factory()->create());

        $this->putJson("/api/noticia/{$pendente->id}/reacao", ['tipo_reacao' => 'curtir'])->assertNotFound();
        $this->putJson("/api/noticia/{$publicada->id}/reacao", ['tipo_reacao' => 'odiar'])->assertUnprocessable();
    });
});
