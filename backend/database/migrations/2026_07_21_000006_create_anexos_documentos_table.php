<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Linha de base: "anexos_documentos" como no DDL original.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('anexos_documentos')) {
            return;
        }

        Schema::create('anexos_documentos', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->string('nome_arquivo');
            $table->text('url_arquivo');
            $table->string('tipo_documento', 50)->nullable();
            $table->timestampTz('data_envio')->nullable()->useCurrent();

            $table->foreign('id_usuario', 'anexos_documentos_id_usuario_fkey')->references('id')->on('usuario')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anexos_documentos');
    }
};
