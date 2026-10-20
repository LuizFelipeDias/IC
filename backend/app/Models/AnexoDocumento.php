<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Tabela legada "anexos_documentos": fotos, modelos 3D e laudos em PDF.
 * url_arquivo guarda o caminho no disco privado, não uma URL pública.
 */
class AnexoDocumento extends Model
{
    protected $table = 'anexos_documentos';

    public $timestamps = false;

    protected $attributes = [
        'status_verificacao' => 'pendente',
        'disco' => 'local',
    ];

    protected $fillable = [
        'nome_arquivo',
        'url_arquivo',
        'tipo_documento',
        'mime',
        'tamanho_bytes',
        'sha256',
        'disco',
        'metadados',
    ];

    protected function casts(): array
    {
        return [
            'data_envio' => 'datetime',
            'metadados' => 'array',
            'tamanho_bytes' => 'integer',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function anexavel(): MorphTo
    {
        return $this->morphTo();
    }
}
