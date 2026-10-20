<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Anexos passam a pertencer a qualquer registro (projeto, doação, laudo) e
 * guardam as medidas extraídas de modelos 3D (triângulos, volume, dimensões).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anexos_documentos', function (Blueprint $table) {
            $table->string('anexavel_type', 50)->nullable();
            $table->unsignedBigInteger('anexavel_id')->nullable();
            $table->json('metadados')->nullable();

            $table->index(['anexavel_type', 'anexavel_id']);
        });
    }

    public function down(): void
    {
        Schema::table('anexos_documentos', function (Blueprint $table) {
            $table->dropIndex(['anexavel_type', 'anexavel_id']);
            $table->dropColumn(['anexavel_type', 'anexavel_id', 'metadados']);
        });
    }
};
