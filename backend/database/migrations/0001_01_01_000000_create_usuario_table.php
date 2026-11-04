<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Linha de base: espelha a tabela "usuario" do script DDL original (PostgreSQL).
 *
 * Em bancos criados antes das migrations a tabela já existe e a migration
 * apenas se registra; as mudanças de esquema vêm nas migrations seguintes.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('usuario')) {
            return;
        }

        Schema::create('usuario', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->string('nome');
            $table->string('telefone', 20);
            $table->string('senha');
            $table->boolean('estudante');
            $table->boolean('empresa');
            $table->string('cpf', 14)->nullable()->unique('usuario_cpf_key');
            $table->boolean('sexo')->nullable();
            $table->string('profissao')->nullable();
            $table->string('cnpj', 18)->nullable()->unique('usuario_cnpj_key');
            $table->timestamps();
            $table->string('email')->nullable();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE usuario ADD CONSTRAINT chk_tipo_usuario CHECK (estudante <> empresa)');
            DB::statement('ALTER TABLE usuario ADD CONSTRAINT chk_dados_consistentes CHECK (
                ((empresa = true) AND (cnpj IS NOT NULL) AND (cpf IS NULL)) OR
                ((estudante = true) AND (cpf IS NOT NULL) AND (sexo IS NOT NULL) AND (profissao IS NOT NULL) AND (cnpj IS NULL))
            )');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario');
    }
};
