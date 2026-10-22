<?php

namespace App\Http\Resources;

use App\Models\Noticia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Noticia */
class NoticiaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $usuario = $request->user('sanctum');

        return [
            'id' => $this->id,
            'id_usuario' => $this->id_usuario,
            'titulo' => $this->titulo,
            'tema' => $this->tema,
            'texto' => $this->texto,
            'status' => $this->status?->value,
            'data_publicacao' => $this->data_publicacao,
            // O motivo da rejeição interessa só ao autor e à moderação.
            'motivo_rejeicao' => $this->when($this->ehAutor($usuario) || $usuario?->ehModerador(), $this->motivo_rejeicao),
            'moderado_em' => $this->moderado_em,
            'reacoes_count' => $this->whenCounted('reacoes'),
            'usuario' => new UsuarioResource($this->whenLoaded('usuario')),
        ];
    }
}
