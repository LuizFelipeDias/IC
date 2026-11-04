<?php

namespace Database\Factories;

use App\Models\LoteFilamento;
use App\Models\Polimero;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoteFilamento>
 */
class LoteFilamentoFactory extends Factory
{
    protected $model = LoteFilamento::class;

    public function definition(): array
    {
        return [
            'id_laboratorio' => Usuario::factory()->laboratorio(),
            'id_polimero' => fn () => Polimero::where('sigla', 'PLA')->value('id'),
            'peso_entrada_g' => 5000,
            'peso_saida_g' => 4200,
            'diametro_nominal_mm' => 1.75,
            'cor' => 'natural',
            'status' => 'aprovado',
            'produzido_em' => now(),
        ];
    }
}
