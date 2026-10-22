<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Linha de base: "projetos" como no DDL original.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('projetos')) {
            return;
        }

        Schema::create('projetos', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->string('titulo');
            $table->string('tema', 100)->nullable();
            $table->string('empresa')->nullable();
            $table->text('texto');
            $table->timestampTz('data_publicacao')->nullable()->useCurrent();
            $table->timestamps();

            $table->foreign('id_usuario', 'projetos_id_usuario_fkey')->references('id')->on('usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projetos');
    }
};
