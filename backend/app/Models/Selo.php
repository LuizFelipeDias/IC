<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Selo extends Model
{
    protected $table = 'selos';

    public $timestamps = false;

    protected $fillable = [
        'slug',
        'nome',
        'descricao',
        'acao',
        'meta',
    ];
}
