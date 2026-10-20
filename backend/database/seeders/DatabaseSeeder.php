<?php

namespace Database\Seeders;

use App\Models\Candidatura;
use App\Models\Chamado;
use App\Models\Curriculo;
use App\Models\Noticia;
use App\Models\Projeto;
use App\Models\Usuario;
use App\Models\Vaga;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Dados de demonstração. Senha de todos: Senha@123
     */
    public function run(): void
    {
        $estudante = Usuario::factory()->create([
            'nome' => 'Estudante Demo',
            'email' => 'estudante@ecohub3d.test',
        ]);

        $empresa = Usuario::factory()->empresa()->create([
            'nome' => 'Empresa Demo',
            'email' => 'empresa@ecohub3d.test',
        ]);

        $vagas = Vaga::factory(6)->for($empresa, 'usuario')->create();
        Candidatura::factory()->for($estudante, 'usuario')->for($vagas->first(), 'vaga')->create();

        Curriculo::factory()->for($estudante, 'usuario')->create();
        Noticia::factory(6)->for($empresa, 'usuario')->create();
        Projeto::factory(6)->for($estudante, 'usuario')->create();
        Chamado::factory(5)->for($estudante, 'usuario')->create();
    }
}
