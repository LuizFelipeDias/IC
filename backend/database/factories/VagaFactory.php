<?php

namespace Database\Factories;

use App\Models\Vaga;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class VagaFactory extends Factory
{
    protected $model = Vaga::class;

    public function definition(): array
    {
        return [
            'id_usuario' => $this->faker->randomNumber(),
            'titulo' => $this->faker->word(),
            'tema' => $this->faker->word(),
            'cep' => $this->faker->word(),
            'cidade' => $this->faker->word(),
            'texto' => $this->faker->word(),
            'data_publicacao' => Carbon::now(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ];
    }
}
