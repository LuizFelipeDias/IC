<?php

namespace Database\Factories;

use App\Models\Curriculo;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class CurriculoFactory extends Factory
{
    protected $model = Curriculo::class;

    public function definition(): array
    {
        return [
            'id_usuario' => $this->faker->randomNumber(),
            'cargo' => $this->faker->word(),
            'habilidades' => $this->faker->word(),
            'competencias' => $this->faker->word(),
            'data_inicio' => Carbon::now(),
            'data_fim' => Carbon::now(),
            'texto' => $this->faker->word(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ];
    }
}
