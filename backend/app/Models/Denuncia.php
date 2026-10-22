<?php

namespace App\Models;

use App\Enums\MotivoDenuncia;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Denuncia extends Model
{
    protected $table = 'denuncias';

    protected $attributes = [
        'status' => 'aberta',
    ];

    // id_denunciante vem sempre do token, no controller.
    protected $fillable = [
        'id_denunciante',
        'denunciavel_type',
        'denunciavel_id',
        'motivo',
        'descricao',
    ];

    protected function casts(): array
    {
        return [
            'motivo' => MotivoDenuncia::class,
            'resolvida_em' => 'datetime',
        ];
    }

    public function denunciavel(): MorphTo
    {
        return $this->morphTo();
    }

    public function denunciante(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_denunciante');
    }
}
