<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Empresas, escolas e laboratórios só recebem os perfis institucionais
 * (abrir chamados, publicar vagas e notícias, receber resíduos) depois que
 * um moderador confere o CNPJ/INEP. Pessoas físicas não passam por isso.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->string('verificacao_status', 20)->nullable()->index();
            $table->timestampTz('verificado_em')->nullable();
            $table->unsignedBigInteger('id_verificador')->nullable();
            $table->text('motivo_verificacao')->nullable();

            $table->foreign('id_verificador', 'usuario_id_verificador_fkey')->references('id')->on('usuario')->nullOnDelete();
        });

        // Instituições que já usavam a plataforma continuam com acesso.
        DB::table('usuario')->where('empresa', true)->update([
            'verificacao_status' => 'verificado',
            'verificado_em' => now(),
        ]);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE usuario ADD CONSTRAINT chk_verificacao_instituicao CHECK (
                (empresa = false AND verificacao_status IS NULL) OR
                (empresa = true AND verificacao_status IN ('pendente', 'verificado', 'rejeitado'))
            )");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE usuario DROP CONSTRAINT IF EXISTS chk_verificacao_instituicao');
        }

        Schema::table('usuario', function (Blueprint $table) {
            $table->dropForeign(DB::getDriverName() === 'sqlite' ? ['id_verificador'] : 'usuario_id_verificador_fkey');
            $table->dropIndex(['verificacao_status']);
            $table->dropColumn(['verificacao_status', 'verificado_em', 'id_verificador', 'motivo_verificacao']);
        });
    }
};
