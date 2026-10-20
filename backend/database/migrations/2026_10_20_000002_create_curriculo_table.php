<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('curriculo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuario')->cascadeOnDelete();
            $table->string('cargo')->nullable();
            $table->text('habilidades')->nullable();
            $table->text('competencias')->nullable();
            $table->date('data_inicio')->nullable();
            $table->date('data_fim')->nullable();
            $table->text('texto');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('curriculo');
    }
};
