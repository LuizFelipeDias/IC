<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Usuario;

class Chamado extends Model
{
    use HasFactory;

    // Define o nome da tabela no banco de dados
    protected $table = 'chamados';

    // Os campos que podem ser preenchidos em massa
    protected $fillable = [
        'id_usuario',
        'titulo',
        'descricao',
        'data_criacao',
        'data_limite',
        'status',
    ];

    // Converte os campos de data para os formatos adequados do Laravel (Carbon)
    protected function casts(): array
    {
        return [
            'data_criacao' => 'datetime',
            'data_limite' => 'date',
        ];
    }

    // Relacionamento indicando que o chamado pertence a um usuário
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
