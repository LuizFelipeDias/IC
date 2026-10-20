<?php

namespace App\Models;

use App\Models\Concerns\Moderavel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Noticia extends Model
{
    use HasFactory, Moderavel;

    protected $table = 'noticias';

    protected $attributes = [
        'status' => 'em_revisao',
    ];

    protected $fillable = [
        'titulo',
        'texto',
        'tema',
    ];

    protected function casts(): array
    {
        return [
            'data_publicacao' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function reacoes(): HasMany
    {
        return $this->hasMany(ReacaoNoticia::class, 'id_noticia');
    }
}
