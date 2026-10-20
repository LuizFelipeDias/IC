<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Laudo técnico (diâmetro, resistência, temperatura) que libera o lote para uso.
 */
class LaudoQualidade extends Model
{
    use HasFactory;

    public const RESULTADOS = ['aprovado', 'reprovado', 'uso_restrito'];

    protected $table = 'laudos_qualidade';

    protected $fillable = [
        'id_anexo',
        'diametro_medio_mm',
        'tolerancia_mm',
        'ovalidade_mm',
        'resistencia_tracao_mpa',
        'alongamento_pct',
        'temp_impressao_min',
        'temp_impressao_max',
        'umidade_pct',
        'resultado',
        'observacoes',
        'emitido_em',
    ];

    protected function casts(): array
    {
        return [
            'diametro_medio_mm' => 'float',
            'tolerancia_mm' => 'float',
            'ovalidade_mm' => 'float',
            'resistencia_tracao_mpa' => 'float',
            'alongamento_pct' => 'float',
            'umidade_pct' => 'float',
            'emitido_em' => 'datetime',
        ];
    }

    public function lote(): BelongsTo
    {
        return $this->belongsTo(LoteFilamento::class, 'id_lote');
    }

    public function laboratorio(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_laboratorio');
    }

    public function anexo(): BelongsTo
    {
        return $this->belongsTo(AnexoDocumento::class, 'id_anexo');
    }
}
