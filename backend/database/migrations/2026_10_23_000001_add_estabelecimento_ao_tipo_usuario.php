<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Estabelecimentos (lojas, oficinas, clínicas com CNPJ) também abrem chamados,
 * como pede o requisito "Escola, CNPJ, Empresas e Estabelecimentos".
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE usuario DROP CONSTRAINT IF EXISTS chk_tipo_usuario_valido');
        DB::statement("ALTER TABLE usuario ADD CONSTRAINT chk_tipo_usuario_valido
            CHECK (tipo_usuario IN ('pessoa_fisica', 'empresa', 'escola', 'laboratorio', 'estabelecimento'))");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::table('usuario')->where('tipo_usuario', 'estabelecimento')->update(['tipo_usuario' => 'empresa']);
        DB::statement('ALTER TABLE usuario DROP CONSTRAINT IF EXISTS chk_tipo_usuario_valido');
        DB::statement("ALTER TABLE usuario ADD CONSTRAINT chk_tipo_usuario_valido
            CHECK (tipo_usuario IN ('pessoa_fisica', 'empresa', 'escola', 'laboratorio'))");
    }
};
