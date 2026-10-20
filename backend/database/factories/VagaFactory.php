<?php

namespace Database\Factories;

use App\Models\Usuario;
use App\Models\Vaga;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vaga>
 */
class VagaFactory extends Factory
{
    protected $model = Vaga::class;

    public function definition(): array
    {
        return [
            'id_usuario' => Usuario::factory()->empresa(),
            'titulo' => fake()->sentence(4),
            'tema' => fake()->randomElement(['Modelagem 3D', 'Pós-processamento', 'Manutenção', 'Reciclagem']),
            'cep' => fake()->numerify('84###-###'),
            'cidade' => 'Ponta Grossa',
            'texto' => fake()->paragraphs(2, true),
            'data_publicacao' => now(),
        ];
    }
}
