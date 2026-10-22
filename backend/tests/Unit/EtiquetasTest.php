<?php

use App\Casts\ListaDeEtiquetas;
use App\Models\Curriculo;
use App\Support\Etiquetas;
use App\Support\UnidadesFederativas;

it('normaliza listas de etiquetas vindas de array ou de texto com vírgulas', function (mixed $entrada, array $esperado) {
    expect(Etiquetas::normalizar($entrada))->toBe($esperado);
})->with([
    'nulo' => [null, []],
    'texto vazio' => ['', []],
    'texto com vírgulas' => ['Fusion 360,  Cura , ,PrusaSlicer', ['Fusion 360', 'Cura', 'PrusaSlicer']],
    'repetidos sem diferenciar caixa' => [['Modelagem 3D', 'modelagem 3d', 'MODELAGEM 3D'], ['Modelagem 3D']],
    'espaços internos' => [["  Impressão \n  FDM  "], ['Impressão FDM']],
    'descarta não textos' => [['SLA', ['x'], null, 3], ['SLA', '3']],
    'acentos' => [['Pós-processamento', 'PÓS-PROCESSAMENTO'], ['Pós-processamento']],
]);

it('monta padrões LIKE escapando curingas', function () {
    expect(Etiquetas::padraoContem(' 100%_ok '))->toBe('%100!%!_ok%')
        ->and(Etiquetas::padraoItemExato('Impressão FDM'))->toBe('%"impressão fdm"%');
});

it('normaliza e valida a UF', function () {
    expect(UnidadesFederativas::normalizar(' pr '))->toBe('PR')
        ->and(UnidadesFederativas::normalizar(42))->toBe(42)
        ->and(UnidadesFederativas::valida('PR'))->toBeTrue()
        ->and(UnidadesFederativas::valida('XX'))->toBeFalse()
        ->and(UnidadesFederativas::valida('pr'))->toBeFalse()
        ->and(UnidadesFederativas::SIGLAS)->toHaveCount(27);
});

it('o cast grava JSON sem escapar acentos e lê sempre uma lista', function () {
    $cast = new ListaDeEtiquetas;
    $modelo = new Curriculo;

    expect($cast->set($modelo, 'especialidades', ['Pós-processamento', 'pós-processamento', 'SLA/resina'], []))->toBe('["Pós-processamento","SLA/resina"]')
        ->and($cast->set($modelo, 'especialidades', [], []))->toBeNull()
        ->and($cast->get($modelo, 'especialidades', '["FDM","SLA"]', []))->toBe(['FDM', 'SLA'])
        ->and($cast->get($modelo, 'especialidades', null, []))->toBe([])
        ->and($cast->get($modelo, 'especialidades', 'não é json', []))->toBe([]);
});
