<?php

namespace Database\Factories;

use App\Enums\Disponibilidade;
use App\Enums\ModalidadePreferida;
use App\Models\Curriculo;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Curriculo>
 */
class CurriculoFactory extends Factory
{
    protected $model = Curriculo::class;

    public function definition(): array
    {
        return [
            'id_usuario' => Usuario::factory(),
            'cargo' => fake()->jobTitle(),
            'habilidades' => 'Modelagem 3D, Fatiamento, Pós-processamento',
            'competencias' => 'Trabalho em equipe, Comunicação',
            'data_inicio' => now()->subYears(2)->toDateString(),
            'data_fim' => now()->subYear()->toDateString(),
            'texto' => fake()->paragraphs(2, true),
            'cidade' => 'Ponta Grossa',
            'uf' => 'PR',
            'disponibilidade' => fake()->randomElement(Disponibilidade::cases()),
            'modalidade_preferida' => fake()->randomElement(ModalidadePreferida::cases()),
            'portfolio_url' => 'https://portfolio.exemplo.com.br/'.fake()->slug(2),
            'especialidades' => fake()->randomElements(Curriculo::ESPECIALIDADES_SUGERIDAS, 3),
            'visivel_no_banco' => true,
        ];
    }

    public function oculto(): static
    {
        return $this->state(fn () => ['visivel_no_banco' => false]);
    }
}
