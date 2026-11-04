<?php

namespace App\Support\Arquivos;

/**
 * Acumula triângulos de uma malha e calcula volume e caixa delimitadora.
 */
final class MetricasMalha
{
    public int $triangulos = 0;

    private float $volume6 = 0.0;

    /** @var array{0: float, 1: float, 2: float} */
    private array $minimo = [INF, INF, INF];

    /** @var array{0: float, 1: float, 2: float} */
    private array $maximo = [-INF, -INF, -INF];

    /**
     * @param  array{0: float, 1: float, 2: float}  $a
     * @param  array{0: float, 1: float, 2: float}  $b
     * @param  array{0: float, 1: float, 2: float}  $c
     */
    public function adicionarTriangulo(array $a, array $b, array $c): void
    {
        $this->triangulos++;

        // Produto misto a · (b × c) = 6 × volume assinado do tetraedro com a origem.
        $this->volume6 += $a[0] * ($b[1] * $c[2] - $b[2] * $c[1])
            - $a[1] * ($b[0] * $c[2] - $b[2] * $c[0])
            + $a[2] * ($b[0] * $c[1] - $b[1] * $c[0]);

        foreach ([$a, $b, $c] as $vertice) {
            for ($eixo = 0; $eixo < 3; $eixo++) {
                $this->minimo[$eixo] = min($this->minimo[$eixo], $vertice[$eixo]);
                $this->maximo[$eixo] = max($this->maximo[$eixo], $vertice[$eixo]);
            }
        }
    }

    public function resultado(string $formato): array
    {
        $dimensao = fn (int $eixo) => round($this->maximo[$eixo] - $this->minimo[$eixo], 2);

        return [
            'formato' => $formato,
            'triangulos' => $this->triangulos,
            'volume_cm3' => round(abs($this->volume6) / 6 / 1000, 3),
            'dimensoes_mm' => ['x' => $dimensao(0), 'y' => $dimensao(1), 'z' => $dimensao(2)],
        ];
    }
}
