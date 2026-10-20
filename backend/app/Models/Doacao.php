<?php

namespace App\Models;

use App\Enums\StatusDoacao;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Peça excedente, carretel usado ou resto de filamento oferecido por um maker.
 */
class Doacao extends Model
{
    use HasFactory;

    public const TIPOS = ['peca_excedente', 'carretel_usado', 'resto_filamento'];

    protected $table = 'doacoes';

    protected $attributes = [
        'status' => 'disponivel',
    ];

    protected $fillable = [
        'id_polimero',
        'tipo',
        'titulo',
        'descricao',
        'peso_estimado_g',
        'cor',
        'cidade',
        'uf',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'status' => StatusDoacao::class,
            'peso_estimado_g' => 'integer',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    /** Fotos da doação. */
    public function anexos(): MorphMany
    {
        return $this->morphMany(AnexoDocumento::class, 'anexavel');
    }

    public function doador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_doador');
    }

    public function polimero(): BelongsTo
    {
        return $this->belongsTo(Polimero::class, 'id_polimero');
    }

    public function solicitacoesColeta(): HasMany
    {
        return $this->hasMany(SolicitacaoColeta::class, 'id_doacao');
    }
}
