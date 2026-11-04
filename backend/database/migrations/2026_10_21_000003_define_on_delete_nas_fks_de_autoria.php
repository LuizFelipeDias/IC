<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * No DDL original, noticias/projetos/vagas referenciam o autor sem ON DELETE,
 * o que impede excluir a conta de quem já publicou algo (erro de FK).
 *
 * - vagas: saem junto com a conta (não faz sentido vaga sem contratante);
 * - notícias e projetos: permanecem publicados, sem autor.
 */
return new class extends Migration
{
    /** @var array<string, string> tabela => ação */
    private array $regras = [
        'vagas' => 'cascade',
        'noticias' => 'set null',
        'projetos' => 'set null',
    ];

    public function up(): void
    {
        foreach ($this->regras as $tabela => $acao) {
            $this->recriarFk($tabela, $acao);
        }
    }

    public function down(): void
    {
        foreach (array_keys($this->regras) as $tabela) {
            $this->recriarFk($tabela, 'no action');
        }
    }

    private function recriarFk(string $tabela, string $acao): void
    {
        Schema::table($tabela, function (Blueprint $table) use ($tabela, $acao) {
            // O SQLite (testes) só remove FK pela coluna; o PostgreSQL usa o nome legado.
            $table->dropForeign(Schema::getConnection()->getDriverName() === 'sqlite'
                ? ['id_usuario']
                : "{$tabela}_id_usuario_fkey");
            $table->foreign('id_usuario', "{$tabela}_id_usuario_fkey")
                ->references('id')->on('usuario')
                ->onDelete($acao);
        });
    }
};
