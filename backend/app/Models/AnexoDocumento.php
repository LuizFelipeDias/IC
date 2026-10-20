<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tabela legada "anexos_documentos", usada também para os PDFs de laudos.
 */
class AnexoDocumento extends Model
{
    protected $table = 'anexos_documentos';

    public $timestamps = false;

    protected $fillable = [
        'nome_arquivo',
        'url_arquivo',
        'tipo_documento',
        'mime',
        'tamanho_bytes',
        'sha256',
        'disco',
    ];

    protected function casts(): array
    {
        return [
            'data_envio' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
