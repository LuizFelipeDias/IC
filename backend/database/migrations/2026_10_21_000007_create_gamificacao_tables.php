<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Gamificação: pontos por ação (histórico imutável), selos e ranking.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Total desnormalizado para ordenar o ranking sem somar o histórico.
        Schema::table('usuario', function (Blueprint $table) {
            $table->integer('pontos_total')->default(0)->index();
        });

        Schema::create('pontuacoes', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->unsignedBigInteger('id_usuario');
            $table->string('acao', 40);
            $table->integer('pontos');
            $table->string('origem_type', 50);
            $table->unsignedBigInteger('origem_id');
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('id_usuario', 'pontuacoes_id_usuario_fkey')->references('id')->on('usuario')->cascadeOnDelete();
            // A mesma ação sobre a mesma origem pontua uma única vez.
            $table->unique(['id_usuario', 'acao', 'origem_type', 'origem_id'], 'pontuacao_unica');
        });

        Schema::create('selos', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->string('slug', 50)->unique('selos_slug_key');
            $table->string('nome', 100);
            $table->string('descricao');
            $table->string('acao', 40);
            $table->integer('meta');
        });

        Schema::create('selos_usuario', function (Blueprint $table) {
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_selo');
            $table->timestampTz('conquistado_em')->useCurrent();

            $table->primary(['id_usuario', 'id_selo']);
            $table->foreign('id_usuario', 'selos_usuario_id_usuario_fkey')->references('id')->on('usuario')->cascadeOnDelete();
            $table->foreign('id_selo', 'selos_usuario_id_selo_fkey')->references('id')->on('selos')->cascadeOnDelete();
        });

        DB::table('selos')->insert([
            ['slug' => 'primeiro-atendimento', 'nome' => 'Primeiro atendimento', 'descricao' => 'Concluiu o primeiro chamado de uma escola ou empresa.', 'acao' => 'chamado_concluido', 'meta' => 1],
            ['slug' => 'mentor-das-escolas', 'nome' => 'Mentor das escolas', 'descricao' => 'Concluiu 5 chamados.', 'acao' => 'chamado_concluido', 'meta' => 5],
            ['slug' => 'autor-do-repositorio', 'nome' => 'Autor do repositório', 'descricao' => 'Teve um projeto aprovado no repositório.', 'acao' => 'projeto_publicado', 'meta' => 1],
            ['slug' => 'reciclador', 'nome' => 'Reciclador', 'descricao' => 'Concluiu a primeira coleta de resíduos.', 'acao' => 'coleta_concluida', 'meta' => 1],
        ]);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE pontuacoes ADD CONSTRAINT chk_pontuacoes_acao
                CHECK (acao IN ('chamado_concluido', 'projeto_publicado', 'coleta_concluida', 'doacao_entregue'))");
            DB::statement('ALTER TABLE selos ADD CONSTRAINT chk_selos_meta CHECK (meta > 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('selos_usuario');
        Schema::dropIfExists('selos');
        Schema::dropIfExists('pontuacoes');

        Schema::table('usuario', function (Blueprint $table) {
            $table->dropIndex(['pontos_total']);
            $table->dropColumn('pontos_total');
        });
    }
};
