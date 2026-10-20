<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Chamado extends Model
{
    use HasFactory;

    public const STATUS = ['Aberto', 'Em Atendimento', 'Resolvido', 'Cancelado'];

    protected $table = 'chamados';

    // id_usuario e data_criacao são definidos pelo servidor, não pelo cliente.
    protected $fillable = [
        'titulo',
        'descricao',
        'data_limite',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'data_criacao' => 'datetime',
            'data_limite' => 'date',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
