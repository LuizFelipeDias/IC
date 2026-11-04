<?php

namespace Database\Factories;

use App\Models\LaudoQualidade;
use App\Models\LoteFilamento;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LaudoQualidade>
 */
class LaudoQualidadeFactory extends Factory
{
    protected $model = LaudoQualidade::class;

    public function definition(): array
    {
        return [
            'id_lote' => LoteFilamento::factory(),
            'id_laboratorio' => Usuario::factory()->laboratorio(),
            'diametro_medio_mm' => 1.748,
            'tolerancia_mm' => 0.030,
            'ovalidade_mm' => 0.015,
            'resistencia_tracao_mpa' => 48.5,
            'alongamento_pct' => 6.2,
            'temp_impressao_min' => 195,
            'temp_impressao_max' => 215,
            'umidade_pct' => 0.4,
            'resultado' => 'aprovado',
            'emitido_em' => now(),
        ];
    }
}
