<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidatura extends Model
{
    protected $table = 'candidaturas';

    /**
     * A tabela NÃO tem created_at/updated_at. Sem esta linha, todo insert
     * do Eloquent quebra com "column created_at does not exist".
     * O carimbo de tempo é o data_candidatura, com DEFAULT no banco.
     */
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_vaga',
        'status',
    ];

    protected $casts = [
        'data_candidatura' => 'datetime',
    ];

    // status tem DEFAULT 'Em análise' no banco: só envie se for mudar.

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function vaga()
    {
        return $this->belongsTo(Vaga::class, 'id_vaga');
    }
}
