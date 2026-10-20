<?php

namespace Database\Factories;

use App\Enums\StatusPublicacao;
use App\Models\Noticia;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Noticia>
 */
class NoticiaFactory extends Factory
{
    protected $model = Noticia::class;

    public function definition(): array
    {
        return [
            'id_usuario' => Usuario::factory(),
            'titulo' => fake()->sentence(6),
            'tema' => fake()->randomElement(['Reciclagem', 'Mercado', 'Pesquisa', 'Educação']),
            'texto' => fake()->paragraphs(3, true),
            'data_publicacao' => now(),
            'status' => StatusPublicacao::Publicado,
        ];
    }

    public function emRevisao(): static
    {
        return $this->state(fn () => ['status' => StatusPublicacao::EmRevisao]);
    }
}
