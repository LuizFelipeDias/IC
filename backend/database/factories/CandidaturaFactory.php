<?php

namespace Database\Factories;

use App\Models\Candidatura;
use App\Models\Usuario;
use App\Models\Vaga;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class CandidaturaFactory extends Factory
{
    protected $model = Candidatura::class;

    public function definition(): array
    {
        return [
            'status' => $this->faker->boolean(),
            'data_candidatura' => $this->faker->word(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),

            'usuario_id' => Usuario::factory(),
            'vaga_id' => Vaga::factory(),
        ];
    }
}
