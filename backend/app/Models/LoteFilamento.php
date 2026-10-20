<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Lote de filamento reciclado. O "codigo" (ULID) é o que vai no QR Code.
 */
class LoteFilamento extends Model
{
    use HasFactory;

    protected $table = 'lotes_filamento';

    protected $attributes = [
        'status' => 'em_processamento',
    ];

    protected $fillable = [
        'id_polimero',
        'peso_entrada_g',
        'peso_saida_g',
        'diametro_nominal_mm',
        'cor',
        'produzido_em',
    ];

    protected static function booted(): void
    {
        static::creating(function (LoteFilamento $lote) {
            $lote->codigo ??= (string) Str::ulid();
        });
    }

    protected function casts(): array
    {
        return [
            'diametro_nominal_mm' => 'float',
            'produzido_em' => 'datetime',
        ];
    }

    public function laboratorio(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_laboratorio');
    }

    public function polimero(): BelongsTo
    {
        return $this->belongsTo(Polimero::class, 'id_polimero');
    }

    /** Coletas que deram origem ao lote, com o peso aproveitado de cada uma. */
    public function coletas(): BelongsToMany
    {
        return $this->belongsToMany(SolicitacaoColeta::class, 'lote_origens', 'id_lote', 'id_solicitacao_coleta')
            ->withPivot('peso_g');
    }

    public function eventos(): HasMany
    {
        return $this->hasMany(LoteEvento::class, 'id_lote');
    }

    public function laudos(): HasMany
    {
        return $this->hasMany(LaudoQualidade::class, 'id_lote');
    }
}
