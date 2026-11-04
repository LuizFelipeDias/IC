<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Ciclo doação -> coleta -> reciclagem -> lote de filamento, com a cadeia de origem
 * de cada lote (base da rastreabilidade por QR Code).
 *
 * Módulos 1 (Doação de makers) e 2 (Receptores e reciclagem) dos requisitos.
 * Laboratórios receptores são usuários com tipo_usuario = 'laboratorio'.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('polimeros', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->string('sigla', 10)->unique('polimeros_sigla_key');
            $table->string('nome', 100);
            $table->decimal('densidade_g_cm3', 5, 3);
            $table->smallInteger('temp_extrusao_min');
            $table->smallInteger('temp_extrusao_max');
            $table->boolean('reciclavel')->default(true);
        });

        // Catálogo de referência, necessário para as FKs abaixo.
        DB::table('polimeros')->insert([
            ['sigla' => 'PLA', 'nome' => 'Ácido polilático', 'densidade_g_cm3' => 1.240, 'temp_extrusao_min' => 190, 'temp_extrusao_max' => 220, 'reciclavel' => true],
            ['sigla' => 'PETG', 'nome' => 'Polietileno tereftalato glicol', 'densidade_g_cm3' => 1.270, 'temp_extrusao_min' => 220, 'temp_extrusao_max' => 250, 'reciclavel' => true],
            ['sigla' => 'ABS', 'nome' => 'Acrilonitrila butadieno estireno', 'densidade_g_cm3' => 1.040, 'temp_extrusao_min' => 220, 'temp_extrusao_max' => 250, 'reciclavel' => true],
            ['sigla' => 'PET', 'nome' => 'Polietileno tereftalato', 'densidade_g_cm3' => 1.380, 'temp_extrusao_min' => 240, 'temp_extrusao_max' => 270, 'reciclavel' => true],
            ['sigla' => 'TPU', 'nome' => 'Poliuretano termoplástico', 'densidade_g_cm3' => 1.210, 'temp_extrusao_min' => 210, 'temp_extrusao_max' => 230, 'reciclavel' => false],
            ['sigla' => 'PP', 'nome' => 'Polipropileno', 'densidade_g_cm3' => 0.900, 'temp_extrusao_min' => 220, 'temp_extrusao_max' => 250, 'reciclavel' => true],
        ]);

        Schema::create('doacoes', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->unsignedBigInteger('id_doador');
            $table->unsignedBigInteger('id_polimero');
            $table->string('tipo', 20);
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->integer('peso_estimado_g');
            $table->string('cor', 30)->nullable();
            $table->string('cidade', 100)->nullable();
            $table->char('uf', 2)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('status', 20)->default('disponivel');
            $table->timestamps();

            $table->foreign('id_doador', 'doacoes_id_doador_fkey')->references('id')->on('usuario')->cascadeOnDelete();
            $table->foreign('id_polimero', 'doacoes_id_polimero_fkey')->references('id')->on('polimeros');
            $table->index(['status', 'id_polimero']);
            $table->index(['latitude', 'longitude']);
        });

        Schema::create('solicitacoes_coleta', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->unsignedBigInteger('id_doacao');
            $table->unsignedBigInteger('id_laboratorio');
            $table->string('modalidade', 10);
            $table->string('status', 20)->default('pendente');
            $table->timestampTz('agendado_para')->nullable();
            $table->integer('peso_recebido_g')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestampTz('concluida_em')->nullable();
            $table->timestamps();

            $table->foreign('id_doacao', 'solicitacoes_coleta_id_doacao_fkey')->references('id')->on('doacoes')->cascadeOnDelete();
            $table->foreign('id_laboratorio', 'solicitacoes_coleta_id_laboratorio_fkey')->references('id')->on('usuario')->cascadeOnDelete();
            $table->index(['id_laboratorio', 'status']);
        });

        Schema::create('lotes_filamento', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            // Identificador público impresso no QR Code (ULID: não sequencial, não adivinhável).
            $table->char('codigo', 26)->unique('lotes_filamento_codigo_key');
            $table->unsignedBigInteger('id_laboratorio');
            $table->unsignedBigInteger('id_polimero');
            $table->integer('peso_entrada_g');
            $table->integer('peso_saida_g')->nullable();
            $table->decimal('diametro_nominal_mm', 4, 2)->default(1.75);
            $table->string('cor', 30)->nullable();
            $table->string('status', 20)->default('em_processamento');
            $table->timestampTz('produzido_em')->nullable();
            $table->timestamps();

            $table->foreign('id_laboratorio', 'lotes_filamento_id_laboratorio_fkey')->references('id')->on('usuario');
            $table->foreign('id_polimero', 'lotes_filamento_id_polimero_fkey')->references('id')->on('polimeros');
            $table->index(['id_laboratorio', 'status']);
        });

        // Quais coletas (e, por elas, quais doações) compõem cada lote.
        Schema::create('lote_origens', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->unsignedBigInteger('id_lote');
            $table->unsignedBigInteger('id_solicitacao_coleta');
            $table->integer('peso_g');

            $table->foreign('id_lote', 'lote_origens_id_lote_fkey')->references('id')->on('lotes_filamento')->cascadeOnDelete();
            $table->foreign('id_solicitacao_coleta', 'lote_origens_id_solicitacao_coleta_fkey')->references('id')->on('solicitacoes_coleta');
            $table->unique(['id_lote', 'id_solicitacao_coleta'], 'lote_origem_unica');
        });

        // Linha do tempo pública do lote.
        Schema::create('lote_eventos', function (Blueprint $table) {
            $table->id()->generatedAs()->always();
            $table->unsignedBigInteger('id_lote');
            $table->string('tipo', 20);
            $table->string('descricao')->nullable();
            $table->json('dados')->nullable();
            $table->unsignedBigInteger('id_responsavel')->nullable();
            $table->timestampTz('ocorrido_em')->useCurrent();

            $table->foreign('id_lote', 'lote_eventos_id_lote_fkey')->references('id')->on('lotes_filamento')->cascadeOnDelete();
            $table->foreign('id_responsavel', 'lote_eventos_id_responsavel_fkey')->references('id')->on('usuario')->nullOnDelete();
            $table->index(['id_lote', 'ocorrido_em']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::unprepared(<<<'SQL'
                ALTER TABLE polimeros ADD CONSTRAINT chk_polimeros_temperatura CHECK (temp_extrusao_min <= temp_extrusao_max);
                ALTER TABLE doacoes ADD CONSTRAINT chk_doacoes_tipo
                    CHECK (tipo IN ('peca_excedente', 'carretel_usado', 'resto_filamento'));
                ALTER TABLE doacoes ADD CONSTRAINT chk_doacoes_status
                    CHECK (status IN ('disponivel', 'reservada', 'coletada', 'cancelada'));
                ALTER TABLE doacoes ADD CONSTRAINT chk_doacoes_peso CHECK (peso_estimado_g > 0);
                ALTER TABLE solicitacoes_coleta ADD CONSTRAINT chk_coleta_modalidade CHECK (modalidade IN ('coleta', 'entrega'));
                ALTER TABLE solicitacoes_coleta ADD CONSTRAINT chk_coleta_status
                    CHECK (status IN ('pendente', 'aceita', 'recusada', 'agendada', 'concluida', 'cancelada'));
                ALTER TABLE solicitacoes_coleta ADD CONSTRAINT chk_coleta_peso CHECK (peso_recebido_g IS NULL OR peso_recebido_g > 0);
                ALTER TABLE lotes_filamento ADD CONSTRAINT chk_lotes_status
                    CHECK (status IN ('em_processamento', 'aguardando_laudo', 'aprovado', 'reprovado', 'distribuido'));
                ALTER TABLE lotes_filamento ADD CONSTRAINT chk_lotes_peso
                    CHECK (peso_entrada_g > 0 AND (peso_saida_g IS NULL OR peso_saida_g <= peso_entrada_g));
                ALTER TABLE lote_origens ADD CONSTRAINT chk_lote_origens_peso CHECK (peso_g > 0);
                ALTER TABLE lote_eventos ADD CONSTRAINT chk_lote_eventos_tipo
                    CHECK (tipo IN ('coletado', 'triturado', 'extrudado', 'laudo_emitido', 'enviado', 'utilizado'));

                -- Uma doação só pode ter uma solicitação de coleta ativa por vez.
                CREATE UNIQUE INDEX solicitacoes_coleta_ativa_unica ON solicitacoes_coleta (id_doacao)
                    WHERE status IN ('pendente', 'aceita', 'agendada');
            SQL);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('lote_eventos');
        Schema::dropIfExists('lote_origens');
        Schema::dropIfExists('lotes_filamento');
        Schema::dropIfExists('solicitacoes_coleta');
        Schema::dropIfExists('doacoes');
        Schema::dropIfExists('polimeros');
    }
};
