<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Registro imutável de cada decisão de moderação (auditoria).
 */
class Moderacao extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'moderacoes';

    protected $fillable = [
        'id_moderador',
        'decisao',
        'justificativa',
    ];

    public function moderavel(): MorphTo
    {
        return $this->morphTo();
    }

    public function moderador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_moderador');
    }
}
