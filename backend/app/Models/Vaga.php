<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vaga extends Model
{
    use HasFactory;

    protected $table = 'vagas';

    public $timestamps = false;

    protected $fillable = [
        'titulo',
        'tema',
        'cep',
        'cidade',
        'texto',
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

    public function candidaturas(): HasMany
    {
        return $this->hasMany(Candidatura::class, 'id_vaga');
    }
}
