<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Controle de qualidade: laudo técnico de cada lote de filamento reciclado.
 * O PDF do laudo reaproveita a tabela legada anexos_documentos, que ganha os
 * metadados necessários para validar e auditar o arquivo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anexos_documentos', function (Blueprint $table) {
            $table->string('mime', 100)->nullable();
            $table->bigInteger('tamanho_bytes')->nullable();
            $table->char('sha256', 64)->nullable()->index();
            $table->string('disco', 20)->default('local');
            $table->string('status_verificacao', 20)->default('pendente');
        });

        Schema::create('laudos_qualidade', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->unsignedBigInteger('id_lote');
            $table->unsignedBigInteger('id_laboratorio');
            $table->unsignedBigInteger('id_responsavel')->nullable();
            $table->unsignedBigInteger('id_anexo')->nullable();
            $table->decimal('diametro_medio_mm', 5, 3);
            $table->decimal('tolerancia_mm', 5, 3);
            $table->decimal('ovalidade_mm', 5, 3)->nullable();
            $table->decimal('resistencia_tracao_mpa', 6, 2)->nullable();
            $table->decimal('alongamento_pct', 5, 2)->nullable();
            $table->smallInteger('temp_impressao_min')->nullable();
            $table->smallInteger('temp_impressao_max')->nullable();
            $table->decimal('umidade_pct', 5, 2)->nullable();
            $table->string('resultado', 20);
            $table->text('observacoes')->nullable();
            $table->timestampTz('emitido_em')->useCurrent();
            $table->timestamps();

            $table->foreign('id_lote', 'laudos_qualidade_id_lote_fkey')->references('id')->on('lotes_filamento')->cascadeOnDelete();
            $table->foreign('id_laboratorio', 'laudos_qualidade_id_laboratorio_fkey')->references('id')->on('usuario');
            $table->foreign('id_responsavel', 'laudos_qualidade_id_responsavel_fkey')->references('id')->on('usuario')->nullOnDelete();
            $table->foreign('id_anexo', 'laudos_qualidade_id_anexo_fkey')->references('id')->on('anexos_documentos')->nullOnDelete();
            $table->index(['id_lote', 'emitido_em']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::unprepared(<<<'SQL'
                ALTER TABLE anexos_documentos ADD CONSTRAINT chk_anexos_status_verificacao
                    CHECK (status_verificacao IN ('pendente', 'aprovado', 'rejeitado'));
                ALTER TABLE laudos_qualidade ADD CONSTRAINT chk_laudos_resultado
                    CHECK (resultado IN ('aprovado', 'reprovado', 'uso_restrito'));
                ALTER TABLE laudos_qualidade ADD CONSTRAINT chk_laudos_medidas
                    CHECK (diametro_medio_mm > 0 AND tolerancia_mm >= 0);
                ALTER TABLE laudos_qualidade ADD CONSTRAINT chk_laudos_temperatura
                    CHECK (temp_impressao_min IS NULL OR temp_impressao_max IS NULL OR temp_impressao_min <= temp_impressao_max);
            SQL);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('laudos_qualidade');

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE anexos_documentos DROP CONSTRAINT IF EXISTS chk_anexos_status_verificacao');
        }

        Schema::table('anexos_documentos', function (Blueprint $table) {
            $table->dropIndex(['sha256']);
            $table->dropColumn(['mime', 'tamanho_bytes', 'sha256', 'disco', 'status_verificacao']);
        });
    }
};
