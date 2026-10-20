<?php

namespace App\Models;

use App\Enums\StatusColeta;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
            'status' => StatusColeta::class,
            'agendado_para' => 'datetime',
            'concluida_em' => 'datetime',
            'peso_recebido_g' => 'integer',
        ];
    }

    public function doacao(): BelongsTo
    {
        return $this->belongsTo(Doacao::class, 'id_doacao');
    }

    /** Lotes que usaram material desta coleta, com o peso aproveitado. */
    public function lotes(): BelongsToMany
    {
        return $this->belongsToMany(LoteFilamento::class, 'lote_origens', 'id_solicitacao_coleta', 'id_lote')->withPivot('peso_g');
    }

    public function laboratorio(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_laboratorio');
    }
}
