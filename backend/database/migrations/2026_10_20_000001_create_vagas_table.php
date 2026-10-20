<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vagas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuario')->cascadeOnDelete();
            $table->string('titulo');
            $table->string('tema', 100)->nullable();
            $table->string('cep', 10)->nullable();
            $table->string('cidade', 100)->nullable();
            $table->text('texto');
            $table->timestamp('data_publicacao')->useCurrent()->index();
        });

        Schema::create('candidaturas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuario')->cascadeOnDelete();
            $table->foreignId('id_vaga')->constrained('vagas')->cascadeOnDelete();
            $table->string('status', 50)->default('Em análise');
            $table->timestamp('data_candidatura')->useCurrent();

            $table->unique(['id_usuario', 'id_vaga']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidaturas');
        Schema::dropIfExists('vagas');
    }
};
