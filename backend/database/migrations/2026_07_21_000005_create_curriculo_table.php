<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Linha de base: "curriculo" como no DDL original.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('curriculo')) {
            return;
        }

        Schema::create('curriculo', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->string('cargo')->nullable();
            $table->string('habilidades')->nullable();
            $table->string('competencias')->nullable();
            $table->date('data_inicio')->nullable();
            $table->date('data_fim')->nullable();
            $table->text('texto');
            $table->timestamps();

            $table->foreign('id_usuario', 'curriculo_id_usuario_fkey')->references('id')->on('usuario')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('curriculo');
    }
};
