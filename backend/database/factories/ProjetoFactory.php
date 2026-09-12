<?php

namespace Database\Factories;

use App\Http\Requests\Projeto;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class ProjetoFactory extends Factory
{
    protected $model = Projeto::class;

    public function definition(): array
    {
        return [
            'id_usuario' => $this->faker->randomNumber(),
            'titulo' => $this->faker->word(),
            'tema' => $this->faker->word(),
            'empresa' => $this->faker->word(),
            'texto' => $this->faker->word(),
            'data_publicacao' => $this->faker->word(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ];
    }
}
