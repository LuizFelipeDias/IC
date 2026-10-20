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
        return [
            'id' => $this->id,
            'id_usuario' => $this->id_usuario,
            'titulo' => $this->titulo,
            'tema' => $this->tema,
            'texto' => $this->texto,
            'data_publicacao' => $this->data_publicacao,
            'usuario' => new UsuarioResource($this->whenLoaded('usuario')),
        ];
    }
}
