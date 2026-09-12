<?php

namespace Database\Factories;

use App\Models\Chamado;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class ChamadoFactory extends Factory
{
    protected $model = Chamado::class;

    public function definition(): array
    {
        return [
            'id_usuario' => $this->faker->randomNumber(),
            'titulo' => $this->faker->word(),
            'descricao' => $this->faker->word(),
            'data_criacao' => Carbon::now(),
            'data_limite' => Carbon::now(),
            'status' => $this->faker->word(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ];
    }
}
