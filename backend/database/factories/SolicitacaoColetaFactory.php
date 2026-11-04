<?php

namespace Database\Factories;

use App\Models\Doacao;
use App\Models\SolicitacaoColeta;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SolicitacaoColeta>
 */
class SolicitacaoColetaFactory extends Factory
{
    protected $model = SolicitacaoColeta::class;

    public function definition(): array
    {
        return [
            'id_doacao' => Doacao::factory(),
            'id_laboratorio' => Usuario::factory()->laboratorio(),
            'modalidade' => 'coleta',
            'status' => 'pendente',
        ];
    }

    public function concluida(): static
    {
        return $this->state(fn () => [
            'status' => 'concluida',
            'peso_recebido_g' => fake()->numberBetween(200, 3000),
            'concluida_em' => now(),
        ]);
    }
}
