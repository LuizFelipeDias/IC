<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Banco de currículos e vagas com campos estruturados: modalidade, contrato,
 * nível, UF, faixa salarial, habilidades e encerramento nas vagas; cidade/UF,
 * disponibilidade, modalidade preferida, portfólio, especialidades e
 * visibilidade no banco nos currículos.
 *
 * As colunas legadas não são alteradas. As CHECKs (só no PostgreSQL) usam
 * NOT VALID onde o banco legado pode ter linhas antigas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vagas', function (Blueprint $table) {
            $table->string('modalidade', 20)->nullable();
            $table->string('tipo_contrato', 20)->nullable();
            $table->string('nivel', 20)->nullable();
            $table->char('uf', 2)->nullable();
            $table->decimal('salario_min', 10, 2)->nullable();
            $table->decimal('salario_max', 10, 2)->nullable();
            $table->json('habilidades')->nullable();
            $table->string('status', 20)->default('aberta');
            $table->date('encerra_em')->nullable();
            $table->timestampTz('encerrada_em')->nullable();

            $table->index(['status', 'data_publicacao'], 'vagas_status_data_publicacao_index');
            $table->index('uf', 'vagas_uf_index');
        });

        Schema::table('curriculo', function (Blueprint $table) {
            $table->string('cidade', 100)->nullable();
            $table->char('uf', 2)->nullable();
            $table->string('disponibilidade', 20)->nullable();
            $table->string('modalidade_preferida', 20)->nullable();
            $table->string('portfolio_url', 255)->nullable();
            $table->json('especialidades')->nullable();
            $table->boolean('visivel_no_banco')->default(true);

            $table->index('visivel_no_banco', 'curriculo_visivel_no_banco_index');
            $table->index('uf', 'curriculo_uf_index');
        });

        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement("ALTER TABLE vagas ADD CONSTRAINT chk_vagas_modalidade
            CHECK (modalidade IS NULL OR modalidade IN ('presencial', 'remoto', 'hibrido'))");
        DB::statement("ALTER TABLE vagas ADD CONSTRAINT chk_vagas_tipo_contrato
            CHECK (tipo_contrato IS NULL OR tipo_contrato IN ('clt', 'estagio', 'bolsa', 'pj', 'temporario', 'voluntario'))");
        DB::statement("ALTER TABLE vagas ADD CONSTRAINT chk_vagas_nivel
            CHECK (nivel IS NULL OR nivel IN ('estagio', 'junior', 'pleno', 'senior', 'nao_se_aplica'))");
        DB::statement("ALTER TABLE vagas ADD CONSTRAINT chk_vagas_status
            CHECK (status IN ('aberta', 'encerrada')) NOT VALID");
        DB::statement("ALTER TABLE vagas ADD CONSTRAINT chk_vagas_uf
            CHECK (uf IS NULL OR uf ~ '^[A-Z]{2}$')");
        DB::statement('ALTER TABLE vagas ADD CONSTRAINT chk_vagas_faixa_salarial
            CHECK ((salario_min IS NULL OR salario_min >= 0) AND (salario_max IS NULL OR salario_max >= 0)
                AND (salario_min IS NULL OR salario_max IS NULL OR salario_max >= salario_min))');
        DB::statement("ALTER TABLE vagas ADD CONSTRAINT chk_vagas_habilidades_lista
            CHECK (habilidades IS NULL OR json_typeof(habilidades) = 'array')");

        DB::statement("ALTER TABLE curriculo ADD CONSTRAINT chk_curriculo_disponibilidade
            CHECK (disponibilidade IS NULL OR disponibilidade IN ('imediata', '30_dias', 'a_combinar'))");
        DB::statement("ALTER TABLE curriculo ADD CONSTRAINT chk_curriculo_modalidade_preferida
            CHECK (modalidade_preferida IS NULL OR modalidade_preferida IN ('presencial', 'remoto', 'hibrido', 'qualquer'))");
        DB::statement("ALTER TABLE curriculo ADD CONSTRAINT chk_curriculo_uf
            CHECK (uf IS NULL OR uf ~ '^[A-Z]{2}$')");
        DB::statement("ALTER TABLE curriculo ADD CONSTRAINT chk_curriculo_portfolio_https
            CHECK (portfolio_url IS NULL OR portfolio_url LIKE 'https://%')");
        DB::statement("ALTER TABLE curriculo ADD CONSTRAINT chk_curriculo_especialidades_lista
            CHECK (especialidades IS NULL OR json_typeof(especialidades) = 'array')");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE vagas
                DROP CONSTRAINT IF EXISTS chk_vagas_modalidade,
                DROP CONSTRAINT IF EXISTS chk_vagas_tipo_contrato,
                DROP CONSTRAINT IF EXISTS chk_vagas_nivel,
                DROP CONSTRAINT IF EXISTS chk_vagas_status,
                DROP CONSTRAINT IF EXISTS chk_vagas_uf,
                DROP CONSTRAINT IF EXISTS chk_vagas_faixa_salarial,
                DROP CONSTRAINT IF EXISTS chk_vagas_habilidades_lista');
            DB::statement('ALTER TABLE curriculo
                DROP CONSTRAINT IF EXISTS chk_curriculo_disponibilidade,
                DROP CONSTRAINT IF EXISTS chk_curriculo_modalidade_preferida,
                DROP CONSTRAINT IF EXISTS chk_curriculo_uf,
                DROP CONSTRAINT IF EXISTS chk_curriculo_portfolio_https,
                DROP CONSTRAINT IF EXISTS chk_curriculo_especialidades_lista');
        }

        Schema::table('vagas', function (Blueprint $table) {
            $table->dropIndex('vagas_status_data_publicacao_index');
            $table->dropIndex('vagas_uf_index');
            $table->dropColumn(['modalidade', 'tipo_contrato', 'nivel', 'uf', 'salario_min', 'salario_max', 'habilidades', 'status', 'encerra_em', 'encerrada_em']);
        });

        Schema::table('curriculo', function (Blueprint $table) {
            $table->dropIndex('curriculo_visivel_no_banco_index');
            $table->dropIndex('curriculo_uf_index');
            $table->dropColumn(['cidade', 'uf', 'disponibilidade', 'modalidade_preferida', 'portfolio_url', 'especialidades', 'visivel_no_banco']);
        });
    }
};
