<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Usuario; // Importando o model Usuario corretamente

class Curriculo extends Model
{
    use HasFactory;

    protected $table = 'curriculo';

    // Desativando as timestamps caso você não tenha criado created_at e updated_at no SQL
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'cargo',
        'habilidades',
        'competencias',
        'data_inicio',
        'data_fim',
        'texto',
    ];

    // Deixamos apenas UMA função de relacionamento, com o nome e a classe corretos
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    protected function casts(): array
    {
        return [
            'data_inicio' => 'date',
            'data_fim' => 'date',
        ];
    }
}
