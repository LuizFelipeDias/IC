<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Curadoria (requisito "Curadoria e segurança"): notícias e projetos passam por
 * moderação antes de ficarem públicos; denúncias e decisões ficam registradas.
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach (['noticias', 'projetos'] as $tabela) {
            // Conteúdo que já existia continua publicado; o novo nasce em revisão.
            Schema::table($tabela, function (Blueprint $table) {
                $table->string('status', 20)->default('publicado');
            });

            Schema::table($tabela, function (Blueprint $table) use ($tabela) {
                $table->string('status', 20)->default('em_revisao')->change();
                $table->text('motivo_rejeicao')->nullable();
                $table->unsignedBigInteger('id_moderador')->nullable();
                $table->timestampTz('moderado_em')->nullable();

                $table->foreign('id_moderador', "{$tabela}_id_moderador_fkey")->references('id')->on('usuario')->nullOnDelete();
                $table->index(['status', 'data_publicacao']);
            });
        }

        Schema::table('projetos', function (Blueprint $table) {
            $table->string('area', 30)->nullable()->index();
            $table->string('licenca', 20)->nullable();
        });

        Schema::create('moderacoes', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->unsignedBigInteger('id_moderador')->nullable();
            $table->string('moderavel_type', 50);
            $table->unsignedBigInteger('moderavel_id');
            $table->string('decisao', 20);
            $table->text('justificativa')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('id_moderador', 'moderacoes_id_moderador_fkey')->references('id')->on('usuario')->nullOnDelete();
            $table->index(['moderavel_type', 'moderavel_id']);
        });

        Schema::create('denuncias', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->unsignedBigInteger('id_denunciante');
            $table->string('denunciavel_type', 50);
            $table->unsignedBigInteger('denunciavel_id');
            $table->string('motivo', 30);
            $table->text('descricao')->nullable();
            $table->string('status', 20)->default('aberta');
            $table->unsignedBigInteger('id_moderador')->nullable();
            $table->timestampTz('resolvida_em')->nullable();
            $table->timestamps();

            $table->foreign('id_denunciante', 'denuncias_id_denunciante_fkey')->references('id')->on('usuario')->cascadeOnDelete();
            $table->foreign('id_moderador', 'denuncias_id_moderador_fkey')->references('id')->on('usuario')->nullOnDelete();
            $table->unique(['id_denunciante', 'denunciavel_type', 'denunciavel_id'], 'denuncia_unica');
            $table->index(['status', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            foreach (['noticias', 'projetos'] as $tabela) {
                DB::statement("ALTER TABLE {$tabela} ADD CONSTRAINT chk_{$tabela}_status
                    CHECK (status IN ('em_revisao', 'publicado', 'rejeitado'))");
            }
            DB::statement("ALTER TABLE projetos ADD CONSTRAINT chk_projetos_area
                CHECK (area IN ('saude', 'educacao', 'agro', 'acessibilidade', 'outro'))");
            DB::statement("ALTER TABLE projetos ADD CONSTRAINT chk_projetos_licenca
                CHECK (licenca IN ('cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'cc0'))");
            DB::statement("ALTER TABLE moderacoes ADD CONSTRAINT chk_moderacoes_decisao
                CHECK (decisao IN ('aprovar', 'rejeitar'))");
            DB::statement("ALTER TABLE denuncias ADD CONSTRAINT chk_denuncias_motivo
                CHECK (motivo IN ('peca_perigosa', 'licenca_violada', 'conteudo_ofensivo', 'spam', 'outro'))");
            DB::statement("ALTER TABLE denuncias ADD CONSTRAINT chk_denuncias_status
                CHECK (status IN ('aberta', 'procedente', 'improcedente'))");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('denuncias');
        Schema::dropIfExists('moderacoes');

        Schema::table('projetos', function (Blueprint $table) {
            $table->dropIndex(['area']);
            $table->dropColumn(['area', 'licenca']);
        });

        foreach (['noticias', 'projetos'] as $tabela) {
            if (DB::getDriverName() === 'pgsql') {
                DB::statement("ALTER TABLE {$tabela} DROP CONSTRAINT IF EXISTS chk_{$tabela}_status");
            }
            Schema::table($tabela, function (Blueprint $table) use ($tabela) {
                $table->dropForeign(DB::getDriverName() === 'sqlite' ? ['id_moderador'] : "{$tabela}_id_moderador_fkey");
                $table->dropIndex(['status', 'data_publicacao']);
                $table->dropColumn(['status', 'motivo_rejeicao', 'id_moderador', 'moderado_em']);
            });
        }
    }
};
