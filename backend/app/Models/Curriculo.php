<?php

namespace App\Models;

use App\Casts\ListaDeEtiquetas;
use App\Enums\Disponibilidade;
use App\Enums\ModalidadePreferida;
use App\Support\Etiquetas;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id_usuario
 * @property bool $visivel_no_banco
 */
class Curriculo extends Model
{
    use HasFactory;

    /** Sugestões exibidas no formulário; o candidato pode acrescentar outras. */
    public const ESPECIALIDADES_SUGERIDAS = [
        'Modelagem 3D',
        'Impressão FDM',
        'Impressão SLA (resina)',
        'Fatiamento',
        'Pós-processamento',
        'Manutenção de impressoras',
        'Escaneamento 3D',
        'Reciclagem de polímeros',
        'Extrusão de filamento',
        'Ensaios mecânicos',
        'Design de produto',
        'Educação maker',
    ];

    protected $table = 'curriculo';

    protected $attributes = [
        'visivel_no_banco' => true,
    ];

    protected $fillable = [
        'cargo',
        'habilidades',
        'competencias',
        'data_inicio',
        'data_fim',
        'texto',
        'cidade',
        'uf',
        'disponibilidade',
        'modalidade_preferida',
        'portfolio_url',
        'especialidades',
        'visivel_no_banco',
    ];

    protected function casts(): array
    {
        return [
            'data_inicio' => 'date',
            'data_fim' => 'date',
            'visivel_no_banco' => 'boolean',
            'especialidades' => ListaDeEtiquetas::class,
            'disponibilidade' => Disponibilidade::class,
            'modalidade_preferida' => ModalidadePreferida::class,
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function scopeVisiveisNoBanco(Builder $query): Builder
    {
        return $query->where('visivel_no_banco', true);
    }

    /**
     * Filtros do banco: ?q= (cargo, habilidades, especialidades), especialidade=, uf=, modalidade=, disponibilidade=.
     * Quem aceita "qualquer" modalidade aparece em toda busca por modalidade.
     *
     * @param  array<string, mixed>  $filtros
     */
    public function scopeFiltrar(Builder $query, array $filtros): Builder
    {
        if (! empty($filtros['especialidade'])) {
            $query->whereRaw("LOWER(CAST(especialidades AS TEXT)) LIKE ? ESCAPE '!'", [Etiquetas::padraoItemExato($filtros['especialidade'])]);
        }

        if (! empty($filtros['uf'])) {
            $query->where('uf', $filtros['uf']);
        }

        if (! empty($filtros['modalidade'])) {
            $query->whereIn('modalidade_preferida', array_unique([$filtros['modalidade'], ModalidadePreferida::Qualquer->value]));
        }

        if (! empty($filtros['disponibilidade'])) {
            $query->where('disponibilidade', $filtros['disponibilidade']);
        }

        if (! empty($filtros['q'])) {
            $padrao = Etiquetas::padraoContem($filtros['q']);
            $query->where(function (Builder $q) use ($padrao) {
                $q->whereRaw("LOWER(cargo) LIKE ? ESCAPE '!'", [$padrao])
                    ->orWhereRaw("LOWER(habilidades) LIKE ? ESCAPE '!'", [$padrao])
                    ->orWhereRaw("LOWER(CAST(especialidades AS TEXT)) LIKE ? ESCAPE '!'", [$padrao]);
            });
        }

        return $query;
    }
}
