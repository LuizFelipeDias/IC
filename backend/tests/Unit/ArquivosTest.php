<?php

use App\Support\Arquivos\ArquivoInvalido;
use App\Support\Arquivos\MetricasMalha;
use App\Support\Arquivos\Modelo3d;
use App\Support\Arquivos\Pdf;
use Tests\Support\ArquivosDeTeste;

describe('modelos 3D', function () {
    it('lê STL binário e ASCII: 12 triângulos, 1 cm³ e cubo de 10 mm', function (string $gerador) {
        $arquivo = ArquivosDeTeste::{$gerador}();

        $metricas = Modelo3d::analisar($arquivo->getRealPath(), 'stl');

        expect($metricas['formato'])->toBe('stl')
            ->and($metricas['triangulos'])->toBe(12)
            ->and($metricas['volume_cm3'])->toEqualWithDelta(1.0, 0.001)
            ->and($metricas['dimensoes_mm'])->toEqual(['x' => 10.0, 'y' => 10.0, 'z' => 10.0]);
    })->with(['stlBinario', 'stlAscii']);

    it('lê 3MF e converte a unidade para milímetros', function () {
        $emCentimetros = ArquivosDeTeste::arquivo3mf(ArquivosDeTeste::modelo3mfCubo('centimeter'));

        $metricas = Modelo3d::analisar($emCentimetros->getRealPath(), '3mf');

        expect($metricas['formato'])->toBe('3mf')
            ->and($metricas['dimensoes_mm']['x'])->toEqual(100.0);
    });

    it('recusa zip bomb, arquivo que não é STL e extensão desconhecida', function () {
        $bomba = ArquivosDeTeste::zipBomb3mf();
        expect(fn () => Modelo3d::analisar($bomba->getRealPath(), '3mf'))->toThrow(ArquivoInvalido::class);

        $falso = tempnam(sys_get_temp_dir(), 'stl');
        file_put_contents($falso, str_repeat('x', 300));
        expect(fn () => Modelo3d::analisar($falso, 'stl'))->toThrow(ArquivoInvalido::class)
            ->and(fn () => Modelo3d::analisar($falso, 'obj'))->toThrow(ArquivoInvalido::class);
    });

    it('calcula o volume pelo produto misto, independente da ordem dos triângulos', function () {
        $malha = new MetricasMalha;
        foreach (array_reverse(ArquivosDeTeste::cuboTriangulos()) as [$a, $b, $c]) {
            $malha->adicionarTriangulo($a, $b, $c);
        }

        expect($malha->resultado('stl')['volume_cm3'])->toEqualWithDelta(1.0, 0.001);
    });
});

describe('PDF de laudo', function () {
    it('aceita um PDF simples', function () {
        $pdf = ArquivosDeTeste::pdf();

        expect(fn () => Pdf::validar($pdf->getRealPath()))->not->toThrow(ArquivoInvalido::class);
    });

    it('recusa PDF com JavaScript ou ação de abrir programa', function (string $marcador) {
        $pdf = ArquivosDeTeste::pdf("<< {$marcador} (x) >>");

        expect(fn () => Pdf::validar($pdf->getRealPath()))->toThrow(ArquivoInvalido::class);
    })->with(['/JavaScript', '/JS', '/Launch', '/RichMedia']);

    it('recusa arquivo que não existe ou não pode ser lido', function () {
        expect(fn () => Pdf::validar('/caminho/inexistente.pdf'))->toThrow(ArquivoInvalido::class);
    });

    it('não confunde /JSON com /JS', function () {
        $pdf = ArquivosDeTeste::pdf('<< /JSON (dados) >>');

        expect(fn () => Pdf::validar($pdf->getRealPath()))->not->toThrow(ArquivoInvalido::class);
    });

    it('recusa arquivo que não começa com %PDF-', function () {
        $falso = tempnam(sys_get_temp_dir(), 'pdf');
        file_put_contents($falso, 'GIF89a nada aqui');

        expect(fn () => Pdf::validar($falso))->toThrow(ArquivoInvalido::class);
    });
});
