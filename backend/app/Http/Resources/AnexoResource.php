<?php

namespace App\Http\Resources;

use App\Models\AnexoDocumento;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

/** @mixin AnexoDocumento */
class AnexoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $imagem = $this->tipo_documento === 'imagem';

        return [
            'id' => $this->id,
            'tipo' => $this->tipo_documento,
            'nome_arquivo' => $this->nome_arquivo,
            'mime' => $this->mime,
            'tamanho_bytes' => $this->tamanho_bytes,
            'sha256' => $this->sha256,
            'status_verificacao' => $this->status_verificacao,
            'metadados' => $this->metadados,
            'data_envio' => $this->data_envio,
            // Imagens recebem link assinado direto para <img src>; demais arquivos pedem o link sob demanda.
            'url' => $this->when($imagem && $this->status_verificacao !== 'rejeitado', fn () => URL::temporarySignedRoute(
                'anexo.arquivo', now()->addMinutes(30), ['anexo' => $this->id],
            )),
        ];
    }
}
