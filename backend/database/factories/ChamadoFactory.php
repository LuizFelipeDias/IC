<?php

namespace Database\Factories;

use App\Enums\LocalAtendimento;
use App\Enums\StatusChamado;
use App\Enums\TipoServico;
use App\Models\Chamado;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Chamado>
 */
class ChamadoFactory extends Factory
{
    protected $model = Chamado::class;

    public function definition(): array
    {
        return [
            'id_usuario' => Usuario::factory()->escola(),
            'titulo' => fake()->sentence(4),
            'descricao' => fake()->paragraph(),
            'tipo_servico' => fake()->randomElement(TipoServico::cases()),
            'cidade' => 'Ponta Grossa',
            'uf' => 'PR',
            'data_criacao' => now(),
            'data_limite' => now()->addDays(15)->toDateString(),
            'status' => StatusChamado::Aberto,
        ];
    }

    /** Chamado já aceito por um prestador (maker/voluntário por padrão). */
    public function emAtendimento(?Usuario $prestador = null): static
    {
        return $this->state(fn () => [
            'status' => StatusChamado::EmAtendimento,
            'id_prestador' => $prestador?->id ?? Usuario::factory()->prestador(),
            'local_atendimento' => LocalAtendimento::Remoto,
            'aceito_em' => now(),
        ]);
    }
}
