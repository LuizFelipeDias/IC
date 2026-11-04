<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tabela legada "reacoes_noticias": uma reação (e comentário opcional) por usuário e notícia.
 */
class ReacaoNoticia extends Model
{
    public const TIPOS = ['curtir', 'util', 'inspirador'];

    protected $table = 'reacoes_noticias';

    public $timestamps = false;

    protected $fillable = [
        'id_noticia',
        'id_usuario',
        'tipo_reacao',
        'comentarios',
    ];

    protected function casts(): array
    {
        return [
            'data_reacao' => 'datetime',
        ];
    }

    public function noticia(): BelongsTo
    {
        return $this->belongsTo(Noticia::class, 'id_noticia');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
