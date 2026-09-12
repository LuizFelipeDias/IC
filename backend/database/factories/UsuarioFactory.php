<?php

namespace Database\Factories;

use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class UsuarioFactory extends Factory
{
    protected $model = Usuario::class;

    public function definition(): array
    {
        return [
            'nome' => $this->faker->word(),
            'telefone' => $this->faker->word(),
            'senha' => $this->faker->word(),
            'estudante' => $this->faker->boolean(),
            'empresa' => $this->faker->boolean(),
            'cpf' => $this->faker->word(),
            'sexo' => $this->faker->boolean(),
            'profissao' => $this->faker->word(),
            'cnpj' => $this->faker->word(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ];
    }
}
