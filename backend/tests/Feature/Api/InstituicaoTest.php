<?php

use App\Models\Chamado;
use App\Models\Usuario;
use App\Support\Documento;
use Laravel\Sanctum\Sanctum;

describe('diretório de instituições', function () {
    it('lista só pessoas jurídicas verificadas, sem dados privados', function () {
        $empresa = Usuario::factory()->empresa()->create(['nome' => 'Campos Gerais Manufatura']);
        Usuario::factory()->escola()->create();
        Usuario::factory()->empresa()->pendente()->create(['nome' => 'Filamentos Verdes Ltda.']);
        Usuario::factory()->create(['nome' => 'Pessoa Física Qualquer']);
        Sanctum::actingAs(Usuario::factory()->create());

        $resposta = $this->getJson('/api/instituicoes')->assertOk();

        expect($resposta->json('data'))->toHaveCount(2)
            ->and(collect($resposta->json('data'))->pluck('nome'))->not->toContain('Filamentos Verdes Ltda.', 'Pessoa Física Qualquer');
        $cartao = collect($resposta->json('data'))->firstWhere('id', $empresa->id);
        expect($cartao)->toHaveKeys(['nome', 'tipo', 'tipo_rotulo', 'numeros'])
            ->not->toHaveKeys(['cnpj', 'email', 'telefone']);
    });

    it('filtra por tipo e por nome', function () {
        Usuario::factory()->laboratorio()->create(['nome' => 'Laboratório de Polímeros']);
        Usuario::factory()->estabelecimento()->create(['nome' => 'Oficina do Bairro']);
        Sanctum::actingAs(Usuario::factory()->create());

        $this->getJson('/api/instituicoes?tipo=estabelecimento')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.nome', 'Oficina do Bairro');
        $this->getJson('/api/instituicoes?q=Polímeros')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/instituicoes?tipo=pessoa_fisica')->assertUnprocessable();
    });

    it('conta chamados resolvidos como prestador', function () {
        $laboratorio = Usuario::factory()->laboratorio()->create();
        Chamado::factory()->count(2)->create(['id_prestador' => $laboratorio->id, 'status' => 'Resolvido', 'local_atendimento' => 'remoto']);
        Sanctum::actingAs(Usuario::factory()->create());

        $this->getJson("/api/instituicoes/{$laboratorio->id}")->assertOk()->assertJsonPath('numeros.chamados_resolvidos', 2);
    });

    it('não mostra pessoa física nem conta pendente no detalhe', function () {
        $pf = Usuario::factory()->create();
        $pendente = Usuario::factory()->empresa()->pendente()->create();
        Sanctum::actingAs(Usuario::factory()->create());

        $this->getJson("/api/instituicoes/{$pf->id}")->assertNotFound();
        $this->getJson("/api/instituicoes/{$pendente->id}")->assertNotFound();
    });

    it('exige login', function () {
        $this->getJson('/api/instituicoes')->assertUnauthorized();
    });
});

describe('estabelecimentos', function () {
    it('estabelecimento verificado abre chamado, mas não aceita', function () {
        $estabelecimento = Usuario::factory()->estabelecimento()->create();
        Sanctum::actingAs($estabelecimento);

        $id = $this->postJson('/api/chamado', [
            'titulo' => 'Peça de reposição para a máquina de café',
            'descricao' => 'Engrenagem quebrada, temos o modelo.',
            'tipo_servico' => 'impressao_peca',
            'data_limite' => now()->addWeeks(2)->toDateString(),
        ])->assertCreated()->json('id');

        $outro = Chamado::factory()->create();
        $this->postJson("/api/chamado/{$outro->id}/aceitar", ['local_atendimento' => 'remoto'])->assertForbidden();
        expect($id)->toBeInt();
    });

    it('estabelecimento pendente não abre chamado', function () {
        Sanctum::actingAs(Usuario::factory()->estabelecimento()->pendente()->create());

        $this->postJson('/api/chamado', [
            'titulo' => 'Peça', 'descricao' => 'x', 'tipo_servico' => 'impressao_peca', 'data_limite' => now()->addWeek()->toDateString(),
        ])->assertForbidden();
    });

    it('cadastro de estabelecimento exige CNPJ e nasce pendente', function () {
        $this->postJson('/api/usuario', [
            'nome' => 'Oficina Mecânica Ponta Grossa', 'email' => 'oficina@exemplo.com', 'telefone' => '42999990000',
            'senha' => 'Senha@123', 'tipo_usuario' => 'estabelecimento',
        ])->assertUnprocessable()->assertJsonValidationErrors('cnpj');

        $this->postJson('/api/usuario', [
            'nome' => 'Oficina Mecânica Ponta Grossa', 'email' => 'oficina@exemplo.com', 'telefone' => '42999990000',
            'senha' => 'Senha@123', 'tipo_usuario' => 'estabelecimento', 'cnpj' => Documento::gerarCnpj(),
        ])->assertCreated();

        expect(Usuario::where('email', 'oficina@exemplo.com')->value('verificacao_status'))->toBe('pendente');
    });
});
