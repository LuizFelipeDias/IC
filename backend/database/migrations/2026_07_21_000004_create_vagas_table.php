<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Linha de base: "vagas" e "candidaturas" como no DDL original, incluindo
 * os triggers que impedem pessoa física de publicar vaga e empresa de se candidatar.
 *
 * O script original não traz o corpo das funções dos triggers; as versões abaixo
 * só são criadas em bancos novos (em bancos legados as funções existentes são mantidas).
 */
return new class extends Migration
{
    public function up(): void
    {
        $pgsql = DB::getDriverName() === 'pgsql';

        if (! Schema::hasTable('vagas')) {
            Schema::create('vagas', function (Blueprint $table) {
                $table->id()->generatedAs()->always();
                $table->unsignedBigInteger('id_usuario')->nullable();
                $table->string('titulo');
                $table->string('tema', 100)->nullable();
                $table->string('cep', 10)->nullable();
                $table->string('cidade', 100)->nullable();
                $table->text('texto');
                $table->timestampTz('data_publicacao')->nullable()->useCurrent();
                $table->timestamps();

                $table->foreign('id_usuario', 'vagas_id_usuario_fkey')->references('id')->on('usuario');
            });

            if ($pgsql) {
                DB::unprepared(<<<'SQL'
                    CREATE OR REPLACE FUNCTION verificar_criador_vaga() RETURNS trigger LANGUAGE plpgsql AS $$
                    BEGIN
                        IF NOT EXISTS (SELECT 1 FROM usuario WHERE id = NEW.id_usuario AND empresa = true) THEN
                            RAISE EXCEPTION 'Apenas usuários com CNPJ podem publicar vagas.';
                        END IF;
                        RETURN NEW;
                    END $$;

                    CREATE TRIGGER trg_bloquear_estudante_vaga BEFORE INSERT ON vagas
                        FOR EACH ROW EXECUTE PROCEDURE verificar_criador_vaga();
                SQL);
            }
        }

        if (! Schema::hasTable('candidaturas')) {
            Schema::create('candidaturas', function (Blueprint $table) {
                $table->id()->generatedAs()->always();
                $table->unsignedBigInteger('id_usuario')->nullable();
                $table->unsignedBigInteger('id_vaga')->nullable();
                $table->string('status', 50)->nullable()->default('Em análise');
                $table->timestampTz('data_candidatura')->nullable()->useCurrent();

                $table->foreign('id_usuario', 'candidaturas_id_usuario_fkey')->references('id')->on('usuario')->cascadeOnDelete();
                $table->foreign('id_vaga', 'candidaturas_id_vaga_fkey')->references('id')->on('vagas')->cascadeOnDelete();
                $table->unique(['id_usuario', 'id_vaga'], 'candidatura_unica');
            });

            if ($pgsql) {
                DB::unprepared(<<<'SQL'
                    CREATE OR REPLACE FUNCTION verificar_candidato_estudante() RETURNS trigger LANGUAGE plpgsql AS $$
                    BEGIN
                        IF NOT EXISTS (SELECT 1 FROM usuario WHERE id = NEW.id_usuario AND estudante = true) THEN
                            RAISE EXCEPTION 'Apenas pessoas físicas podem se candidatar a vagas.';
                        END IF;
                        RETURN NEW;
                    END $$;

                    CREATE TRIGGER trg_bloquear_empresa_candidatura BEFORE INSERT ON candidaturas
                        FOR EACH ROW EXECUTE PROCEDURE verificar_candidato_estudante();
                SQL);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('candidaturas');
        Schema::dropIfExists('vagas');

        if (DB::getDriverName() === 'pgsql') {
            DB::unprepared('DROP FUNCTION IF EXISTS verificar_candidato_estudante(); DROP FUNCTION IF EXISTS verificar_criador_vaga();');
        }
    }
};
