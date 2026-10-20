<?php

namespace Database\Factories;

use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Usuario>
 */
class UsuarioFactory extends Factory
{
    protected $model = Usuario::class;

    /** Senha em texto puro de todos os usuários de teste/seed. */
    public const SENHA = 'Senha@123';

    public function definition(): array
    {
        return [
            'nome' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'telefone' => fake()->numerify('(42) 9####-####'),
            'senha' => self::SENHA,
            'estudante' => true,
            'empresa' => false,
            'cpf' => fake()->unique()->numerify('###.###.###-##'),
            'sexo' => fake()->boolean(),
            'profissao' => fake()->jobTitle(),
            'cnpj' => null,
        ];
    }

    public function empresa(): static
    {
        return $this->state(fn () => [
            'estudante' => false,
            'empresa' => true,
            'cpf' => null,
            'sexo' => null,
            'cnpj' => fake()->unique()->numerify('##.###.###/0001-##'),
        ]);
    }
}
