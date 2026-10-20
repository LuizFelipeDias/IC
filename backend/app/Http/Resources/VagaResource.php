<?php

namespace App\Http\Resources;

use App\Models\Vaga;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Vaga */
class VagaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_usuario' => $this->id_usuario,
            'titulo' => $this->titulo,
            'tema' => $this->tema,
            'cep' => $this->cep,
            'cidade' => $this->cidade,
            'texto' => $this->texto,
            'data_publicacao' => $this->data_publicacao,
            'usuario' => new UsuarioResource($this->whenLoaded('usuario')),
            'candidaturas_count' => $this->whenCounted('candidaturas'),
        ];
    }
}
