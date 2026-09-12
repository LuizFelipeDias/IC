<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Usuario;

class Vaga extends Model
{
    use HasFactory;

    // Aponta para a tabela no plural
    protected $table = 'vagas';


    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'titulo',
        'tema',
        'cep',
        'cidade',
        'texto',
        'data_publicacao',
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
