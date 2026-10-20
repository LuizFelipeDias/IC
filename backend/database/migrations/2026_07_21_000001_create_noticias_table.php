<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Linha de base: "noticias" e "reacoes_noticias" como no DDL original.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('noticias')) {
            Schema::create('noticias', function (Blueprint $table) {
                $table->id()->generatedAs()->always();
                $table->unsignedBigInteger('id_usuario')->nullable();
                $table->string('titulo');
                $table->text('texto');
                $table->timestampTz('data_publicacao')->nullable()->useCurrent();
                $table->timestamps();
                $table->string('tema')->nullable();

                $table->foreign('id_usuario', 'noticias_id_usuario_fkey')->references('id')->on('usuario');
            });
        }

        if (! Schema::hasTable('reacoes_noticias')) {
            Schema::create('reacoes_noticias', function (Blueprint $table) {
                $table->id()->generatedAs()->always();
                $table->unsignedBigInteger('id_noticia')->nullable();
                $table->unsignedBigInteger('id_usuario')->nullable();
                $table->string('comentarios')->nullable();
                $table->string('tipo_reacao', 20);
                $table->timestampTz('data_reacao')->nullable()->useCurrent();

                $table->foreign('id_noticia', 'reacoes_noticias_id_noticia_fkey')->references('id')->on('noticias')->cascadeOnDelete();
                $table->foreign('id_usuario', 'reacoes_noticias_id_usuario_fkey')->references('id')->on('usuario')->cascadeOnDelete();
                $table->unique(['id_noticia', 'id_usuario'], 'reacoes_noticias_id_noticia_id_usuario_key');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reacoes_noticias');
        Schema::dropIfExists('noticias');
    }
};
