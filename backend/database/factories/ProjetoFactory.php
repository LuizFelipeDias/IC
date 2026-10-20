<?php

namespace Database\Factories;

use App\Models\Projeto;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Projeto>
 */
class ProjetoFactory extends Factory
{
    protected $model = Projeto::class;

    public function definition(): array
    {
        return [
            'id_usuario' => Usuario::factory(),
            'titulo' => fake()->sentence(4),
            'tema' => fake()->randomElement(['Saúde', 'Educação', 'Agro', 'Acessibilidade']),
            'empresa' => fake()->company(),
            'texto' => fake()->paragraphs(3, true),
            'data_publicacao' => now(),
        ];
    }
}
