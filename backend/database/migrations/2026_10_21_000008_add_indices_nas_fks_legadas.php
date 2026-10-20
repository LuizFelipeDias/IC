<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * O PostgreSQL não indexa colunas de chave estrangeira automaticamente.
 * Sem estes índices, "minhas vagas", "meus chamados" e a exclusão em cascata
 * de um usuário fazem varredura completa das tabelas.
 */
return new class extends Migration
{
    /** @var array<string, list<string>> */
    private array $indices = [
        'noticias' => ['id_usuario'],
        'projetos' => ['id_usuario'],
        'vagas' => ['id_usuario'],
        'chamados' => ['id_usuario'],
        'curriculo' => ['id_usuario'],
        'candidaturas' => ['id_vaga'],
        'reacoes_noticias' => ['id_usuario'],
        'anexos_documentos' => ['id_usuario'],
        'doacoes' => ['id_doador'],
        'lote_origens' => ['id_solicitacao_coleta'],
        'laudos_qualidade' => ['id_laboratorio'],
    ];

    public function up(): void
    {
        foreach ($this->indices as $tabela => $colunas) {
            Schema::table($tabela, function (Blueprint $table) use ($colunas) {
                foreach ($colunas as $coluna) {
                    $table->index($coluna);
                }
            });
        }
    }

    public function down(): void
    {
        foreach ($this->indices as $tabela => $colunas) {
            Schema::table($tabela, function (Blueprint $table) use ($colunas) {
                foreach ($colunas as $coluna) {
                    $table->dropIndex([$coluna]);
                }
            });
        }
    }
};
