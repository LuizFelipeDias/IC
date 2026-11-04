<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Catálogo de polímeros (PLA, PETG, ABS...). Preenchido pela migration de rastreabilidade.
 */
class Polimero extends Model
{
    protected $table = 'polimeros';

    public $timestamps = false;

    protected $fillable = [
        'sigla',
        'nome',
        'densidade_g_cm3',
        'temp_extrusao_min',
        'temp_extrusao_max',
        'reciclavel',
    ];

    protected function casts(): array
    {
        return [
            'densidade_g_cm3' => 'float',
            'reciclavel' => 'boolean',
        ];
    }
}
