<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fluxo de atendimento: a escola/empresa abre o chamado e um prestador
 * (laboratório ou maker/voluntário) escolhe o local de atendimento e o aceita.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chamados', function (Blueprint $table) {
            $table->string('tipo_servico', 30)->nullable();
            $table->string('cidade', 100)->nullable();
            $table->char('uf', 2)->nullable();
            $table->unsignedBigInteger('id_prestador')->nullable();
            $table->string('local_atendimento', 30)->nullable();
            $table->timestampTz('aceito_em')->nullable();
            $table->timestampTz('concluido_em')->nullable();

            $table->foreign('id_prestador', 'chamados_id_prestador_fkey')->references('id')->on('usuario')->nullOnDelete();
            $table->index('status');
            $table->index('id_prestador');
        });

        if (DB::getDriverName() === 'pgsql') {
            // NOT VALID: não rejeita linhas antigas do banco legado, só as novas.
            DB::statement("ALTER TABLE chamados ADD CONSTRAINT chk_chamados_status
                CHECK (status IN ('Aberto', 'Em Atendimento', 'Resolvido', 'Cancelado')) NOT VALID");
            DB::statement("ALTER TABLE chamados ADD CONSTRAINT chk_chamados_tipo_servico
                CHECK (tipo_servico IN ('impressao_peca', 'treinamento_impressao', 'scanner_3d', 'modelagem', 'manutencao', 'outro'))");
            DB::statement("ALTER TABLE chamados ADD CONSTRAINT chk_chamados_local_atendimento
                CHECK (local_atendimento IN ('instituicao_solicitante', 'espaco_prestador', 'remoto'))");
            DB::statement('ALTER TABLE chamados ADD CONSTRAINT chk_chamados_prestador_diferente
                CHECK (id_prestador IS NULL OR id_prestador <> id_usuario)');
            DB::statement("ALTER TABLE chamados ADD CONSTRAINT chk_chamados_atendimento_completo
                CHECK (status NOT IN ('Em Atendimento', 'Resolvido') OR (id_prestador IS NOT NULL AND local_atendimento IS NOT NULL)) NOT VALID");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE chamados
                DROP CONSTRAINT IF EXISTS chk_chamados_status,
                DROP CONSTRAINT IF EXISTS chk_chamados_tipo_servico,
                DROP CONSTRAINT IF EXISTS chk_chamados_local_atendimento,
                DROP CONSTRAINT IF EXISTS chk_chamados_prestador_diferente,
                DROP CONSTRAINT IF EXISTS chk_chamados_atendimento_completo');
        }

        Schema::table('chamados', function (Blueprint $table) {
            $table->dropForeign('chamados_id_prestador_fkey');
            $table->dropIndex(['status']);
            $table->dropIndex(['id_prestador']);
            $table->dropColumn(['tipo_servico', 'cidade', 'uf', 'id_prestador', 'local_atendimento', 'aceito_em', 'concluido_em']);
        });
    }
};
