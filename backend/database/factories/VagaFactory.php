<?php

namespace Database\Factories;

use App\Enums\ModalidadeTrabalho;
use App\Enums\NivelVaga;
use App\Enums\StatusVaga;
use App\Enums\TipoContrato;
use App\Models\Usuario;
use App\Models\Vaga;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vaga>
 */
class VagaFactory extends Factory
{
    protected $model = Vaga::class;

    public function definition(): array
    {
        return [
            'id_usuario' => Usuario::factory()->empresa(),
            'titulo' => fake()->sentence(4),
            'tema' => fake()->randomElement(['Modelagem 3D', 'Pós-processamento', 'Manutenção', 'Reciclagem']),
            'cep' => fake()->numerify('84###-###'),
            'cidade' => 'Ponta Grossa',
            'uf' => 'PR',
            'texto' => fake()->paragraphs(2, true),
            'modalidade' => fake()->randomElement(ModalidadeTrabalho::cases()),
            'tipo_contrato' => fake()->randomElement(TipoContrato::cases()),
            'nivel' => fake()->randomElement(NivelVaga::cases()),
            'habilidades' => fake()->randomElements(['Fusion 360', 'Cura', 'PrusaSlicer', 'Blender', 'Lixamento', 'Pintura'], 2),
            'status' => StatusVaga::Aberta,
            'data_publicacao' => now(),
        ];
    }

    public function encerrada(): static
    {
        return $this->state(fn () => ['status' => StatusVaga::Encerrada, 'encerrada_em' => now()]);
    }

    public function comSalario(float $minimo, float $maximo): static
    {
        return $this->state(fn () => ['salario_min' => $minimo, 'salario_max' => $maximo]);
    }
}
