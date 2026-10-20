<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Pedido de um laboratório para receber uma doação (coleta ou entrega).
 */
class SolicitacaoColeta extends Model
{
    use HasFactory;

    protected $table = 'solicitacoes_coleta';

    protected $attributes = [
        'status' => 'pendente',
    ];

    protected $fillable = [
        'id_doacao',
        'modalidade',
        'agendado_para',
        'observacoes',
    ];

    protected function casts(): array
    {
        return [
            'agendado_para' => 'datetime',
            'concluida_em' => 'datetime',
        ];
    }

    public function doacao(): BelongsTo
    {
        return $this->belongsTo(Doacao::class, 'id_doacao');
    }

    public function laboratorio(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_laboratorio');
    }
}
