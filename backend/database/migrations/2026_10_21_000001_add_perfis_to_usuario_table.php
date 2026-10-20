<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Perfis de acesso (RBAC).
 *
 * Os booleanos estudante/empresa continuam valendo como "pessoa física" e
 * "pessoa jurídica" (e as constraints originais seguem válidas); tipo_usuario
 * detalha a pessoa jurídica em empresa, escola ou laboratório.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->string('tipo_usuario', 20)->default('pessoa_fisica');
            $table->boolean('prestador_servico')->default(false);
            $table->string('papel', 20)->default('usuario');
            $table->string('codigo_inep', 8)->nullable()->unique('usuario_codigo_inep_key');
            $table->rememberToken();

            // No banco legado o e-mail não era único; o login depende disso.
            $table->unique('email', 'usuario_email_key');
            $table->index('tipo_usuario');
        });

        DB::table('usuario')->where('empresa', true)->update(['tipo_usuario' => 'empresa']);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE usuario ADD CONSTRAINT chk_tipo_usuario_valido
                CHECK (tipo_usuario IN ('pessoa_fisica', 'empresa', 'escola', 'laboratorio'))");
            DB::statement("ALTER TABLE usuario ADD CONSTRAINT chk_tipo_usuario_documento
                CHECK ((tipo_usuario = 'pessoa_fisica') = estudante)");
            DB::statement("ALTER TABLE usuario ADD CONSTRAINT chk_prestador_pessoa_fisica
                CHECK (NOT prestador_servico OR tipo_usuario = 'pessoa_fisica')");
            DB::statement("ALTER TABLE usuario ADD CONSTRAINT chk_papel_valido
                CHECK (papel IN ('usuario', 'moderador', 'admin'))");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE usuario
                DROP CONSTRAINT IF EXISTS chk_tipo_usuario_valido,
                DROP CONSTRAINT IF EXISTS chk_tipo_usuario_documento,
                DROP CONSTRAINT IF EXISTS chk_prestador_pessoa_fisica,
                DROP CONSTRAINT IF EXISTS chk_papel_valido');
        }

        Schema::table('usuario', function (Blueprint $table) {
            $table->dropUnique('usuario_email_key');
            $table->dropUnique('usuario_codigo_inep_key');
            $table->dropIndex(['tipo_usuario']);
            $table->dropColumn(['tipo_usuario', 'prestador_servico', 'papel', 'codigo_inep', 'remember_token']);
        });
    }
};
