<?php

use App\Models\Chamado;
use App\Models\Usuario;
use Laravel\Sanctum\Sanctum;

function dadosChamado(array $extra = []): array
{
    return array_merge([
        'titulo' => 'Oficina de impressão 3D para o 9º ano',
        'descricao' => 'Precisamos de um treinamento introdutório.',
        'tipo_servico' => 'treinamento_impressao',
        'data_limite' => now()->addMonth()->toDateString(),
        'cidade' => 'Ponta Grossa',
        'uf' => 'pr',
    ], $extra);
}

describe('criação', function () {
    it('escola e empresa abrem chamados', function (string $tipo) {
        Sanctum::actingAs($solicitante = Usuario::factory()->{$tipo}()->create());

        $this->postJson('/api/chamado', dadosChamado(['id_usuario' => 999, 'status' => 'Resolvido']))
            ->assertCreated()
            ->assertJsonPath('id_usuario', $solicitante->id)
            ->assertJsonPath('status', 'Aberto')
            ->assertJsonPath('uf', 'PR');
    })->with(['escola', 'empresa']);

    it('pessoa física, maker e laboratório não abrem chamados', function (string $estado) {
        $usuario = match ($estado) {
            'pessoa_fisica' => Usuario::factory()->create(),
            'maker' => Usuario::factory()->prestador()->create(),
            'laboratorio' => Usuario::factory()->laboratorio()->create(),
        };
        Sanctum::actingAs($usuario);

        $this->postJson('/api/chamado', dadosChamado())->assertForbidden();
    })->with(['pessoa_fisica', 'maker', 'laboratorio']);

    it('exige tipo de serviço e prazo', function () {
        Sanctum::actingAs(Usuario::factory()->escola()->create());

        $this->postJson('/api/chamado', dadosChamado(['tipo_servico' => null, 'data_limite' => null]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['tipo_servico', 'data_limite']);
    });
});

describe('visualização', function () {
    it('pessoa física comum não acessa a área de chamados', function () {
        Sanctum::actingAs(Usuario::factory()->create());

        $this->getJson('/api/chamado')->assertForbidden();
        $this->getJson('/api/chamado/opcoes')->assertForbidden();
    });

    it('solicitante vê só os próprios chamados', function () {
        $escola = Usuario::factory()->escola()->create();
        Chamado::factory(2)->for($escola, 'usuario')->create();
        Chamado::factory()->create();

        Sanctum::actingAs($escola);

        $this->getJson('/api/chamado')->assertOk()->assertJsonCount(2, 'data');
    });

    it('prestador vê os abertos e os que atende, mas não os atendidos por outros', function () {
        $maker = Usuario::factory()->prestador()->create();
        Chamado::factory(2)->create();
        Chamado::factory()->emAtendimento($maker)->create();
        Chamado::factory()->emAtendimento()->create();

        Sanctum::actingAs($maker);

        $this->getJson('/api/chamado')->assertOk()->assertJsonCount(3, 'data');
    });

    it('lista as opções de locais de atendimento', function () {
        Sanctum::actingAs(Usuario::factory()->laboratorio()->create());

        $this->getJson('/api/chamado/opcoes')
            ->assertOk()
            ->assertJsonCount(3, 'locais_atendimento')
            ->assertJsonPath('locais_atendimento.0.valor', 'instituicao_solicitante');
    });
});

describe('atendimento', function () {
    it('prestador escolhe o local e aceita; o contato é liberado só aos envolvidos', function () {
        $chamado = Chamado::factory()->create();
        Sanctum::actingAs($laboratorio = Usuario::factory()->laboratorio()->create());

        $this->postJson("/api/chamado/{$chamado->id}/aceitar", ['local_atendimento' => 'espaco_prestador'])
            ->assertOk()
            ->assertJsonPath('status', 'Em Atendimento')
            ->assertJsonPath('id_prestador', $laboratorio->id)
            ->assertJsonPath('local_atendimento', 'espaco_prestador')
            ->assertJsonPath('contato.solicitante.email', $chamado->usuario->email);
    });

    it('exige um local de atendimento válido', function () {
        $chamado = Chamado::factory()->create();
        Sanctum::actingAs(Usuario::factory()->prestador()->create());

        $this->postJson("/api/chamado/{$chamado->id}/aceitar", ['local_atendimento' => 'lua'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('local_atendimento');
    });

    it('solicitante não aceita o próprio chamado nem um chamado já aceito é aceito de novo', function () {
        $chamado = Chamado::factory()->emAtendimento()->create();

        Sanctum::actingAs($chamado->usuario);
        $this->postJson("/api/chamado/{$chamado->id}/aceitar", ['local_atendimento' => 'remoto'])->assertForbidden();

        Sanctum::actingAs(Usuario::factory()->prestador()->create());
        $this->postJson("/api/chamado/{$chamado->id}/aceitar", ['local_atendimento' => 'remoto'])->assertForbidden();
    });

    it('só o prestador responsável conclui', function () {
        $chamado = Chamado::factory()->emAtendimento()->create();

        Sanctum::actingAs(Usuario::factory()->prestador()->create());
        $this->postJson("/api/chamado/{$chamado->id}/concluir")->assertForbidden();

        Sanctum::actingAs($chamado->prestador);
        $this->postJson("/api/chamado/{$chamado->id}/concluir")
            ->assertOk()
            ->assertJsonPath('status', 'Resolvido');
    });

    it('solicitante edita só enquanto está aberto e pode cancelar', function () {
        $chamado = Chamado::factory()->emAtendimento()->create();
        Sanctum::actingAs($chamado->usuario);

        $this->patchJson("/api/chamado/{$chamado->id}", ['titulo' => 'Novo'])->assertForbidden();
        $this->deleteJson("/api/chamado/{$chamado->id}")->assertForbidden();
        $this->postJson("/api/chamado/{$chamado->id}/cancelar")
            ->assertOk()
            ->assertJsonPath('status', 'Cancelado');
    });

    it('outro solicitante não vê nem altera o chamado', function () {
        $chamado = Chamado::factory()->create();
        Sanctum::actingAs(Usuario::factory()->escola()->create());

        $this->getJson("/api/chamado/{$chamado->id}")->assertForbidden();
        $this->patchJson("/api/chamado/{$chamado->id}", ['titulo' => 'X'])->assertForbidden();
        $this->postJson("/api/chamado/{$chamado->id}/cancelar")->assertForbidden();
    });
});
