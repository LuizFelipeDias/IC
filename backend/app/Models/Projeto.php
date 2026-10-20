<?php

namespace App\Models;

use App\Enums\AreaProjeto;
use App\Enums\LicencaProjeto;
use App\Models\Concerns\Moderavel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Projeto extends Model
{
    use HasFactory, Moderavel;

    protected $table = 'projetos';

    protected $attributes = [
        'status' => 'em_revisao',
    ];

    protected $fillable = [
        'titulo',
        'tema',
        'empresa',
        'texto',
        'area',
        'licenca',
    ];

    protected function casts(): array
    {
        return [
            'data_publicacao' => 'datetime',
            'area' => AreaProjeto::class,
            'licenca' => LicencaProjeto::class,
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
