<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Usuario;

class Noticia extends Model
{
    use HasFactory;

    // Define o nome da tabela explicitamente
    protected $table = 'noticias';

    protected $fillable = [
        'id_usuario',
        'titulo',
        'texto',
        'data_publicacao',
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
}
