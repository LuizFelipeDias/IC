<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoteEvento extends Model
{
    public const TIPOS = ['coletado', 'triturado', 'extrudado', 'laudo_emitido', 'enviado', 'utilizado'];

    protected $table = 'lote_eventos';

    public $timestamps = false;

    protected $fillable = [
        'tipo',
        'descricao',
        'dados',
        'id_responsavel',
        'ocorrido_em',
    ];

    protected function casts(): array
    {
        return [
            'dados' => 'array',
            'ocorrido_em' => 'datetime',
        ];
    }

    public function lote(): BelongsTo
    {
        return $this->belongsTo(LoteFilamento::class, 'id_lote');
    }
}
