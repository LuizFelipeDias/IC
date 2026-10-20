<?php

namespace App\Http\Resources;

use App\Models\Projeto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Projeto */
class ProjetoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_usuario' => $this->id_usuario,
            'titulo' => $this->titulo,
            'tema' => $this->tema,
            'empresa' => $this->empresa,
            'texto' => $this->texto,
            'data_publicacao' => $this->data_publicacao,
            'usuario' => new UsuarioResource($this->whenLoaded('usuario')),
        ];
    }
}
