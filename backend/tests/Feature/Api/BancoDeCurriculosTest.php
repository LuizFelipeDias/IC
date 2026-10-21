<?php

use App\Models\Candidatura;
use App\Models\Curriculo;
use App\Models\Usuario;
use App\Models\Vaga;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;

/*
 * Banco de currículos e vagas com campos estruturados:
 * modalidade, contrato, nível, UF, faixa salarial, habilidades, encerramento,
 * especialidades, portfólio e visibilidade no banco.
 */

function dadosVaga(array $extra = []): array
{
    return [
        'titulo' => 'Técnico(a) em impressão 3D',
        'texto' => 'Operação de impressoras FDM.',
        'tema' => 'Manutenção',
        'modalidade' => 'hibrido',
        'tipo_contrato' => 'clt',
        'nivel' => 'junior',
        'cidade' => 'Ponta Grossa',
        'uf' => 'pr',
        ...$extra,
    ];
}

/* ------------------------------ RBAC ------------------------------ */

it('estudante e escola pendente não publicam vaga; empresa e estabelecimento verificados publicam', function () {
    Sanctum::actingAs(Usuario::factory()->create());
    $this->postJson('/api/vaga', dadosVaga())->assertForbidden();

    Sanctum::actingAs(Usuario::factory()->escola()->pendente()->create());
    $this->postJson('/api/vaga', dadosVaga())->assertForbidden();

    Sanctum::actingAs(Usuario::factory()->empresa()->create());
    $this->postJson('/api/vaga', dadosVaga())->assertCreated();

    Sanctum::actingAs(Usuario::factory()->estabelecimento()->create());
    $this->postJson('/api/vaga', dadosVaga())->assertCreated();

    expect(Vaga::count())->toBe(2);
});

it('candidato (pessoa física) se candidata; empresa não', function () {
    $vaga = Vaga::factory()->create();

    Sanctum::actingAs(Usuario::factory()->empresa()->create());
    $this->postJson('/api/candidatura', ['id_vaga' => $vaga->id])->assertForbidden();

    Sanctum::actingAs(Usuario::factory()->create());
    $this->postJson('/api/candidatura', ['id_vaga' => $vaga->id])->assertCreated()->assertJsonPath('status', 'Em análise');
});

it('só pessoa física cadastra currículo', function () {
    Sanctum::actingAs(Usuario::factory()->empresa()->create());
    $this->postJson('/api/curriculo', ['texto' => 'Resumo'])->assertForbidden();

    Sanctum::actingAs(Usuario::factory()->create());
    $this->postJson('/api/curriculo', ['texto' => 'Resumo'])->assertCreated()->assertJsonPath('visivel_no_banco', true);
});

it('banco de currículos é exclusivo de contratante e mostra só os visíveis', function () {
    $visivel = Curriculo::factory()->create();
    $oculto = Curriculo::factory()->oculto()->create();

    foreach ([Usuario::factory()->create(), Usuario::factory()->prestador()->create(), Usuario::factory()->empresa()->pendente()->create()] as $naoContratante) {
        Sanctum::actingAs($naoContratante);
        $this->getJson('/api/curriculo')->assertForbidden();
    }

    Sanctum::actingAs(Usuario::factory()->empresa()->create());
    $this->getJson('/api/curriculo')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $visivel->id)
        ->assertJsonPath('data.0.contato.email', $visivel->usuario->email);

    $this->getJson("/api/curriculo/{$visivel->id}")->assertOk();
    $this->getJson("/api/curriculo/{$oculto->id}")->assertForbidden();
});

it('cada pessoa vê e edita só o próprio currículo, mesmo oculto do banco', function () {
    $meu = Curriculo::factory()->oculto()->create();
    $outro = Curriculo::factory()->create();

    Sanctum::actingAs($meu->usuario);
    $this->getJson('/api/curriculo/meus')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $meu->id);
    $this->getJson("/api/curriculo/{$meu->id}")->assertOk()->assertJsonPath('visivel_no_banco', false);
    $this->getJson("/api/curriculo/{$outro->id}")->assertForbidden();
    $this->patchJson("/api/curriculo/{$outro->id}", ['cargo' => 'Invadido'])->assertForbidden();
    $this->patchJson("/api/curriculo/{$meu->id}", ['visivel_no_banco' => true])->assertOk()->assertJsonPath('visivel_no_banco', true);
});

/* ------------------------- Campos da vaga ------------------------- */

it('publica a vaga com os campos estruturados e normaliza UF e habilidades', function () {
    Sanctum::actingAs(Usuario::factory()->empresa()->create());

    $this->postJson('/api/vaga', dadosVaga([
        'salario_min' => 2500,
        'salario_max' => '3200.50',
        'habilidades' => ['Fusion 360', ' fusion 360 ', 'Pós-processamento', ''],
        'encerra_em' => now()->addDays(10)->toDateString(),
    ]))
        ->assertCreated()
        ->assertJsonPath('uf', 'PR')
        ->assertJsonPath('modalidade', 'hibrido')
        ->assertJsonPath('modalidade_rotulo', 'Híbrido')
        ->assertJsonPath('tipo_contrato_rotulo', 'CLT')
        ->assertJsonPath('nivel_rotulo', 'Júnior')
        ->assertJsonPath('salario_min', 2500)
        ->assertJsonPath('salario_max', 3200.5)
        ->assertJsonPath('habilidades', ['Fusion 360', 'Pós-processamento'])
        ->assertJsonPath('status', 'aberta')
        ->assertJsonPath('aceita_candidaturas', true);
});

it('omite a faixa salarial quando não informada', function () {
    Sanctum::actingAs(Usuario::factory()->empresa()->create());

    $resposta = $this->postJson('/api/vaga', dadosVaga())->assertCreated();

    expect($resposta->json())->not->toHaveKey('salario_min')->not->toHaveKey('salario_max');
});

it('valida modalidade, contrato, nível, UF, salário e encerramento', function () {
    Sanctum::actingAs(Usuario::factory()->empresa()->create());

    $this->postJson('/api/vaga', ['titulo' => 'X', 'texto' => 'Y'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['modalidade', 'tipo_contrato', 'nivel']);

    $this->postJson('/api/vaga', dadosVaga([
        'modalidade' => 'teletrabalho',
        'tipo_contrato' => 'freela',
        'nivel' => 'diretor',
        'uf' => 'XX',
        'salario_min' => -10,
        'encerra_em' => now()->subDay()->toDateString(),
        'habilidades' => [str_repeat('a', 61)],
    ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['modalidade', 'tipo_contrato', 'nivel', 'uf', 'salario_min', 'encerra_em', 'habilidades.0']);
});

it('recusa salário máximo menor que o mínimo, inclusive em PATCH parcial', function () {
    $empresa = Usuario::factory()->empresa()->create();
    Sanctum::actingAs($empresa);

    $this->postJson('/api/vaga', dadosVaga(['salario_min' => 3000, 'salario_max' => 2000]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['salario_max' => 'O salário máximo deve ser maior ou igual ao salário mínimo.']);

    $vaga = Vaga::factory()->for($empresa, 'usuario')->comSalario(2000, 3000)->create();

    $this->patchJson("/api/vaga/{$vaga->id}", ['salario_max' => 1500])->assertUnprocessable()->assertJsonValidationErrors('salario_max');
    $this->patchJson("/api/vaga/{$vaga->id}", ['salario_max' => 3500])->assertOk()->assertJsonPath('salario_max', 3500);
});

/* --------------------------- Encerramento --------------------------- */

it('só o dono encerra a vaga; encerrada sai do mural e continua em /vaga/minhas', function () {
    $vaga = Vaga::factory()->create();

    Sanctum::actingAs(Usuario::factory()->empresa()->create());
    $this->postJson("/api/vaga/{$vaga->id}/encerrar")->assertForbidden();

    Sanctum::actingAs(Usuario::factory()->create());
    $this->postJson("/api/vaga/{$vaga->id}/encerrar")->assertForbidden();

    Sanctum::actingAs($vaga->usuario);
    $this->postJson("/api/vaga/{$vaga->id}/encerrar")
        ->assertOk()
        ->assertJsonPath('status', 'encerrada')
        ->assertJsonPath('aceita_candidaturas', false);

    expect($vaga->fresh()->encerrada_em)->not->toBeNull();

    $this->getJson('/api/vaga')->assertOk()->assertJsonCount(0, 'data');
    $this->getJson('/api/vaga?status=encerrada')->assertOk()->assertJsonCount(1, 'data');
    $this->getJson('/api/vaga/minhas')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.status', 'encerrada');
});

it('não aceita candidatura em vaga encerrada ou com prazo vencido', function () {
    $encerrada = Vaga::factory()->encerrada()->create();
    $vencida = Vaga::factory()->create(['encerra_em' => now()->subDay()->toDateString()]);
    Sanctum::actingAs(Usuario::factory()->create());

    $this->postJson('/api/candidatura', ['id_vaga' => $encerrada->id])
        ->assertStatus(409)
        ->assertJsonPath('message', 'Esta vaga está encerrada e não recebe novas candidaturas.');
    $this->postJson('/api/candidatura', ['id_vaga' => $vencida->id])->assertStatus(409);

    expect(Candidatura::count())->toBe(0);
    $this->getJson('/api/vaga')->assertOk()->assertJsonCount(0, 'data');
});

it('vaga que encerra hoje ainda aceita candidatura', function () {
    $vaga = Vaga::factory()->create(['encerra_em' => today()->toDateString()]);
    Sanctum::actingAs(Usuario::factory()->create());

    $this->postJson('/api/candidatura', ['id_vaga' => $vaga->id])->assertCreated();
});

it('candidatura repetida não duplica mesmo depois do encerramento', function () {
    $vaga = Vaga::factory()->create();
    Sanctum::actingAs($candidato = Usuario::factory()->create());

    $this->postJson('/api/candidatura', ['id_vaga' => $vaga->id])->assertCreated();
    $vaga->forceFill(['status' => 'encerrada'])->save();
    $this->postJson('/api/candidatura', ['id_vaga' => $vaga->id])->assertOk();

    expect(Candidatura::where('id_usuario', $candidato->id)->count())->toBe(1);
});

it('o dono vê os candidatos e muda o status; o candidato vê o novo status', function () {
    $vaga = Vaga::factory()->create();
    $candidato = Usuario::factory()->create();
    $candidatura = Candidatura::factory()->for($candidato, 'usuario')->for($vaga, 'vaga')->create();

    Sanctum::actingAs($vaga->usuario);
    $this->getJson("/api/vaga/{$vaga->id}/candidaturas")->assertOk()->assertJsonPath('data.0.usuario.email', $candidato->email);
    $this->patchJson("/api/candidatura/{$candidatura->id}", ['status' => 'Talvez'])->assertUnprocessable();
    $this->patchJson("/api/candidatura/{$candidatura->id}", ['status' => 'Aprovada'])->assertOk();

    Sanctum::actingAs($candidato);
    $this->getJson('/api/candidatura')
        ->assertOk()
        ->assertJsonPath('data.0.status', 'Aprovada')
        ->assertJsonPath('data.0.vaga.titulo', $vaga->titulo)
        ->assertJsonPath('data.0.vaga.usuario.nome', $vaga->usuario->nome);
});

/* ------------------------- Filtros do mural ------------------------- */

it('filtra vagas por modalidade, contrato, nível, tema, UF, cidade e busca', function () {
    $remota = Vaga::factory()->create(['titulo' => 'Modelador remoto', 'modalidade' => 'remoto', 'tipo_contrato' => 'pj', 'nivel' => 'senior', 'tema' => 'Modelagem 3D', 'uf' => 'SC', 'cidade' => 'Joinville', 'habilidades' => ['Blender']]);
    $estagio = Vaga::factory()->create(['titulo' => 'Estágio de bancada', 'modalidade' => 'presencial', 'tipo_contrato' => 'estagio', 'nivel' => 'estagio', 'tema' => 'Reciclagem', 'uf' => 'PR', 'cidade' => 'Ponta Grossa', 'habilidades' => ['Extrusão de filamento']]);
    $hibrida = Vaga::factory()->create(['titulo' => 'Técnico híbrido', 'modalidade' => 'hibrido', 'tipo_contrato' => 'clt', 'nivel' => 'pleno', 'tema' => 'Manutenção', 'uf' => 'PR', 'cidade' => 'Curitiba', 'habilidades' => ['Pós-processamento']]);
    Vaga::factory()->encerrada()->create(['modalidade' => 'remoto']);

    $ids = fn (string $url) => collect($this->getJson($url)->assertOk()->json('data'))->pluck('id')->sort()->values()->all();

    expect($ids('/api/vaga'))->toBe(collect([$remota->id, $estagio->id, $hibrida->id])->sort()->values()->all())
        ->and($ids('/api/vaga?modalidade=remoto'))->toBe([$remota->id])
        ->and($ids('/api/vaga?modalidade=remoto,hibrido'))->toBe(collect([$remota->id, $hibrida->id])->sort()->values()->all())
        ->and($ids('/api/vaga?tipo_contrato=estagio'))->toBe([$estagio->id])
        ->and($ids('/api/vaga?nivel=pleno'))->toBe([$hibrida->id])
        ->and($ids('/api/vaga?tema=Reciclagem,Manutenção'))->toBe(collect([$estagio->id, $hibrida->id])->sort()->values()->all())
        ->and($ids('/api/vaga?uf=sc'))->toBe([$remota->id])
        ->and($ids('/api/vaga?cidade=ponta'))->toBe([$estagio->id])
        ->and($ids('/api/vaga?q=modelador'))->toBe([$remota->id])
        ->and($ids('/api/vaga?q=pós-processamento'))->toBe([$hibrida->id])
        ->and($ids('/api/vaga?q=extrus'))->toBe([$estagio->id])
        ->and($ids('/api/vaga?uf=PR&modalidade=presencial'))->toBe([$estagio->id]);
});

it('recusa filtros de vaga com valores inválidos', function () {
    $this->getJson('/api/vaga?modalidade=teletrabalho')->assertUnprocessable()->assertJsonValidationErrors('modalidade.0');
    $this->getJson('/api/vaga?status=pausada')->assertUnprocessable()->assertJsonValidationErrors('status');
    $this->getJson('/api/vaga?uf=ZZ')->assertUnprocessable()->assertJsonValidationErrors('uf');
});

it('expõe as opções dos formulários em português', function () {
    $this->getJson('/api/vaga/opcoes')
        ->assertOk()
        ->assertJsonPath('modalidades.2', ['valor' => 'hibrido', 'rotulo' => 'Híbrido'])
        ->assertJsonPath('niveis.4.valor', 'nao_se_aplica')
        ->assertJsonCount(6, 'tipos_contrato')
        ->assertJsonCount(27, 'ufs')
        ->assertJsonFragment(['Reciclagem de polímeros']);
});

/* ------------------------- Currículo e banco ------------------------- */

it('salva os campos novos do currículo', function () {
    Sanctum::actingAs(Usuario::factory()->create());

    $id = $this->postJson('/api/curriculo', [
        'cargo' => 'Técnica em polímeros',
        'texto' => 'Resumo',
        'cidade' => 'Ponta Grossa',
        'uf' => 'pr',
        'disponibilidade' => '30_dias',
        'modalidade_preferida' => 'qualquer',
        'portfolio_url' => 'https://meuportfolio.com.br',
        'especialidades' => ['Modelagem 3D', 'Impressão FDM', 'modelagem 3d', 'Reciclagem de polímeros'],
        'visivel_no_banco' => false,
    ])
        ->assertCreated()
        ->assertJsonPath('uf', 'PR')
        ->assertJsonPath('disponibilidade_rotulo', 'Em até 30 dias')
        ->assertJsonPath('modalidade_preferida_rotulo', 'Qualquer modalidade')
        ->assertJsonPath('especialidades', ['Modelagem 3D', 'Impressão FDM', 'Reciclagem de polímeros'])
        ->assertJsonPath('visivel_no_banco', false)
        ->json('id');

    $this->patchJson("/api/curriculo/{$id}", ['especialidades' => ['SLA']])->assertOk()->assertJsonPath('especialidades', ['SLA']);
});

it('valida portfólio https, disponibilidade, modalidade, UF e especialidades', function () {
    Sanctum::actingAs(Usuario::factory()->create());

    $this->postJson('/api/curriculo', [
        'texto' => 'Resumo',
        'portfolio_url' => 'http://inseguro.com',
        'disponibilidade' => 'amanha',
        'modalidade_preferida' => 'lua',
        'uf' => 'XY',
        'especialidades' => array_fill(0, 16, 'x'),
        'visivel_no_banco' => 'talvez',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['portfolio_url', 'disponibilidade', 'modalidade_preferida', 'uf', 'visivel_no_banco'])
        ->assertJsonPath('errors.portfolio_url.0', 'O link do portfólio deve ser um endereço https:// válido.');

    $this->postJson('/api/curriculo', ['texto' => 'Resumo', 'portfolio_url' => 'javascript:alert(1)'])->assertJsonValidationErrors('portfolio_url');
    $this->postJson('/api/curriculo', ['texto' => 'Resumo', 'especialidades' => [str_repeat('a', 61)]])->assertJsonValidationErrors('especialidades.0');
});

it('filtra o banco por especialidade, UF, modalidade, disponibilidade e busca', function () {
    $ana = Curriculo::factory()->create(['cargo' => 'Estagiária em manufatura aditiva', 'habilidades' => 'Fusion 360, Cura', 'especialidades' => ['Modelagem 3D', 'Impressão FDM'], 'uf' => 'PR', 'modalidade_preferida' => 'qualquer', 'disponibilidade' => 'imediata']);
    $carla = Curriculo::factory()->create(['cargo' => 'Técnica em polímeros', 'habilidades' => 'Extrusora', 'especialidades' => ['Reciclagem de polímeros', 'Pós-processamento'], 'uf' => 'PR', 'modalidade_preferida' => 'hibrido', 'disponibilidade' => '30_dias']);
    $joao = Curriculo::factory()->create(['cargo' => 'Designer de produto', 'habilidades' => 'Blender', 'especialidades' => ['Impressão FDM industrial'], 'uf' => 'SC', 'modalidade_preferida' => 'remoto', 'disponibilidade' => 'a_combinar']);
    Curriculo::factory()->oculto()->create(['especialidades' => ['Impressão FDM'], 'uf' => 'PR']);

    Sanctum::actingAs(Usuario::factory()->laboratorio()->create());
    $ids = fn (string $url) => collect($this->getJson($url)->assertOk()->json('data'))->pluck('id')->sort()->values()->all();

    expect($ids('/api/curriculo'))->toHaveCount(3)
        ->and($ids('/api/curriculo?especialidade=impressão fdm'))->toBe([$ana->id])
        ->and($ids('/api/curriculo?especialidade=Pós-processamento'))->toBe([$carla->id])
        ->and($ids('/api/curriculo?uf=sc'))->toBe([$joao->id])
        ->and($ids('/api/curriculo?modalidade=remoto'))->toBe(collect([$ana->id, $joao->id])->sort()->values()->all())
        ->and($ids('/api/curriculo?modalidade=hibrido&uf=PR'))->toBe(collect([$ana->id, $carla->id])->sort()->values()->all())
        ->and($ids('/api/curriculo?disponibilidade=30_dias'))->toBe([$carla->id])
        ->and($ids('/api/curriculo?q=designer'))->toBe([$joao->id])
        ->and($ids('/api/curriculo?q=fusion'))->toBe([$ana->id])
        ->and($ids('/api/curriculo?q=reciclagem'))->toBe([$carla->id])
        ->and($ids('/api/curriculo?q=100%'))->toBe([]);

    $this->getJson('/api/curriculo?disponibilidade=ontem')->assertUnprocessable()->assertJsonValidationErrors('disponibilidade');
});

it('grava as listas em JSON sem escapar acentos', function () {
    $curriculo = Curriculo::factory()->create(['especialidades' => ['Pós-processamento']]);

    expect(DB::table('curriculo')->where('id', $curriculo->id)->value('especialidades'))->toBe('["Pós-processamento"]');
});
