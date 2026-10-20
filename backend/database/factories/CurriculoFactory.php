<?php

namespace Database\Factories;

use App\Models\Curriculo;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Curriculo>
 */
class CurriculoFactory extends Factory
{
    protected $model = Curriculo::class;

    public function definition(): array
    {
        return [
            'id_usuario' => Usuario::factory(),
            'cargo' => fake()->jobTitle(),
            'habilidades' => 'Modelagem 3D, Fatiamento, Pós-processamento',
            'competencias' => 'Trabalho em equipe, Comunicação',
            'data_inicio' => now()->subYears(2)->toDateString(),
            'data_fim' => now()->subYear()->toDateString(),
            'texto' => fake()->paragraphs(2, true),
        ];
    }
}
