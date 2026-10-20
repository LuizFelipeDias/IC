<?php

namespace Database\Factories;

use App\Models\Candidatura;
use App\Models\Usuario;
use App\Models\Vaga;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Candidatura>
 */
class CandidaturaFactory extends Factory
{
    protected $model = Candidatura::class;

    public function definition(): array
    {
        return [
            'id_usuario' => Usuario::factory(),
            'id_vaga' => Vaga::factory(),
            'status' => 'Em análise',
        ];
    }
}
