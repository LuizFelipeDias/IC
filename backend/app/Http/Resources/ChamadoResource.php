<?php

namespace App\Http\Resources;

use App\Models\Chamado;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Chamado */
class ChamadoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_usuario' => $this->id_usuario,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'status' => $this->status,
            'data_criacao' => $this->data_criacao,
            'data_limite' => $this->data_limite?->toDateString(),
            'usuario' => new UsuarioResource($this->whenLoaded('usuario')),
        ];
    }
}
