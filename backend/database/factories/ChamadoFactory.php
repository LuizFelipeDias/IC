<?php

namespace Database\Factories;

use App\Models\Chamado;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Chamado>
 */
class ChamadoFactory extends Factory
{
    protected $model = Chamado::class;

    public function definition(): array
    {
        return [
            'id_usuario' => Usuario::factory(),
            'titulo' => fake()->sentence(4),
            'descricao' => fake()->paragraph(),
            'data_criacao' => now(),
            'data_limite' => now()->addDays(15)->toDateString(),
            'status' => fake()->randomElement(Chamado::STATUS),
        ];
    }
}
