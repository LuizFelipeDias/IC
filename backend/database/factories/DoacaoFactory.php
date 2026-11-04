<?php

namespace Database\Factories;

use App\Models\Doacao;
use App\Models\Polimero;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Doacao>
 */
class DoacaoFactory extends Factory
{
    protected $model = Doacao::class;

    public function definition(): array
    {
        return [
            'id_doador' => Usuario::factory()->prestador(),
            'id_polimero' => fn () => Polimero::where('sigla', 'PLA')->value('id'),
            'tipo' => fake()->randomElement(Doacao::TIPOS),
            'titulo' => 'Sobras de impressão',
            'descricao' => fake()->sentence(),
            'peso_estimado_g' => fake()->numberBetween(200, 3000),
            'cor' => fake()->randomElement(['branco', 'preto', 'azul', 'natural']),
            'cidade' => 'Ponta Grossa',
            'uf' => 'PR',
        ];
    }
}
