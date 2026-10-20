<?php

namespace Database\Factories;

use App\Enums\PapelUsuario;
use App\Enums\TipoUsuario;
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

    /** Pessoa física por padrão (estudante/profissional). */
    public function definition(): array
    {
        return [
            'nome' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'telefone' => fake()->numerify('(42) 9####-####'),
            'senha' => self::SENHA,
            'tipo_usuario' => TipoUsuario::PessoaFisica,
            'estudante' => true,
            'empresa' => false,
            'cpf' => fake()->unique()->numerify('###.###.###-##'),
            'sexo' => fake()->boolean(),
            'profissao' => fake()->jobTitle(),
            'cnpj' => null,
            'codigo_inep' => null,
            'prestador_servico' => false,
        ];
    }

    /** Maker/voluntário: pessoa física que atende chamados. */
    public function prestador(): static
    {
        return $this->state(fn () => ['prestador_servico' => true]);
    }

    public function empresa(): static
    {
        return $this->pessoaJuridica(TipoUsuario::Empresa);
    }

    public function escola(): static
    {
        return $this->pessoaJuridica(TipoUsuario::Escola)
            ->state(fn () => ['codigo_inep' => fake()->unique()->numerify('4#######')]);
    }

    public function laboratorio(): static
    {
        return $this->pessoaJuridica(TipoUsuario::Laboratorio);
    }

    public function moderador(): static
    {
        return $this->state(fn () => ['papel' => PapelUsuario::Moderador]);
    }

    private function pessoaJuridica(TipoUsuario $tipo): static
    {
        return $this->state(fn () => [
            'tipo_usuario' => $tipo,
            'estudante' => false,
            'empresa' => true,
            'cpf' => null,
            'sexo' => null,
            'profissao' => null,
            'cnpj' => fake()->unique()->numerify('##.###.###/0001-##'),
            'prestador_servico' => false,
        ]);
    }
}
