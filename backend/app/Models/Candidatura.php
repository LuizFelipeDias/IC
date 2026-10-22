<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Candidatura extends Model
{
    use HasFactory;

    /** Valores aceitos na coluna status (varchar(50), default 'Em análise'). */
    public const STATUS = ['Em análise', 'Aprovada', 'Reprovada', 'Cancelada'];

    protected $table = 'candidaturas';

    /**
     * A tabela NÃO tem created_at/updated_at.
     * O carimbo de tempo é o data_candidatura, com DEFAULT no banco.
     */
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_vaga',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'data_candidatura' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function vaga(): BelongsTo
    {
        return $this->belongsTo(Vaga::class, 'id_vaga');
    }
}
