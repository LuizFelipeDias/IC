<?php

namespace App\Models;

use App\Casts\ListaDeEtiquetas;
use App\Enums\ModalidadeTrabalho;
use App\Enums\NivelVaga;
use App\Enums\StatusVaga;
use App\Enums\TipoContrato;
use App\Support\Etiquetas;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property StatusVaga $status
 * @property int $id_usuario
 * @property Carbon|null $encerra_em
 */
class Vaga extends Model
{
    use HasFactory;

    protected $table = 'vagas';

    protected $attributes = [
        'status' => 'aberta',
    ];

    // id_usuario, status e encerrada_em são definidos pelo servidor.
    protected $fillable = [
        'titulo',
        'tema',
        'cep',
        'cidade',
        'uf',
        'texto',
        'modalidade',
        'tipo_contrato',
        'nivel',
        'salario_min',
        'salario_max',
        'habilidades',
        'encerra_em',
    ];

    protected function casts(): array
    {
        return [
            'data_publicacao' => 'datetime',
            'encerra_em' => 'date',
            'encerrada_em' => 'datetime',
            'salario_min' => 'decimal:2',
            'salario_max' => 'decimal:2',
            'habilidades' => ListaDeEtiquetas::class,
            'status' => StatusVaga::class,
            'modalidade' => ModalidadeTrabalho::class,
            'tipo_contrato' => TipoContrato::class,
            'nivel' => NivelVaga::class,
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function candidaturas(): HasMany
    {
        return $this->hasMany(Candidatura::class, 'id_vaga');
    }

    /**
     * Aberta = não foi encerrada pelo contratante e a data de encerramento ainda não passou.
     */
    public function estaAberta(): bool
    {
        return $this->status === StatusVaga::Aberta
            && ($this->encerra_em === null || $this->encerra_em->endOfDay()->isFuture());
    }

    /** Situação efetiva: uma vaga com encerra_em vencido aparece como encerrada. */
    public function situacao(): StatusVaga
    {
        return $this->estaAberta() ? StatusVaga::Aberta : StatusVaga::Encerrada;
    }

    public function scopeAbertas(Builder $query): Builder
    {
        return $query->where('status', StatusVaga::Aberta)
            ->where(fn (Builder $q) => $q->whereNull('encerra_em')->orWhereDate('encerra_em', '>=', today()));
    }

    public function scopeEncerradas(Builder $query): Builder
    {
        return $query->where(fn (Builder $q) => $q->where('status', StatusVaga::Encerrada)
            ->orWhereDate('encerra_em', '<', today()));
    }

    /**
     * Filtros do mural: ?q=&tema=&modalidade=&tipo_contrato=&nivel=&uf=&cidade=
     * (tema, modalidade, tipo_contrato e nivel aceitam vários valores separados por vírgula).
     *
     * @param  array<string, mixed>  $filtros
     */
    public function scopeFiltrar(Builder $query, array $filtros): Builder
    {
        foreach (['tema', 'modalidade', 'tipo_contrato', 'nivel'] as $campo) {
            if (! empty($filtros[$campo])) {
                $query->whereIn($campo, (array) $filtros[$campo]);
            }
        }

        if (! empty($filtros['uf'])) {
            $query->where('uf', $filtros['uf']);
        }

        if (! empty($filtros['cidade'])) {
            $query->whereRaw("LOWER(cidade) LIKE ? ESCAPE '!'", [Etiquetas::padraoContem($filtros['cidade'])]);
        }

        if (! empty($filtros['q'])) {
            $padrao = Etiquetas::padraoContem($filtros['q']);
            $query->where(function (Builder $q) use ($padrao) {
                foreach (['titulo', 'tema', 'cidade'] as $coluna) {
                    $q->orWhereRaw("LOWER({$coluna}) LIKE ? ESCAPE '!'", [$padrao]);
                }
                $q->orWhereRaw("LOWER(CAST(habilidades AS TEXT)) LIKE ? ESCAPE '!'", [$padrao]);
            });
        }

        return $query;
    }
}
