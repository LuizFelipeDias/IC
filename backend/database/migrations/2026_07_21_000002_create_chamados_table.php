<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Linha de base: "chamados" como no DDL original.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('chamados')) {
            return;
        }

        Schema::create('chamados', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->string('titulo');
            $table->text('descricao');
            $table->timestampTz('data_criacao')->nullable()->useCurrent();
            $table->date('data_limite');
            $table->string('status', 50)->nullable()->default('Aberto');
            $table->timestamps();

            $table->foreign('id_usuario', 'chamados_id_usuario_fkey')->references('id')->on('usuario')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chamados');
    }
};
