<?php

namespace App\Http\Resources;

use App\Models\Curriculo;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Curriculo */
class CurriculoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_usuario' => $this->id_usuario,
            'cargo' => $this->cargo,
            'habilidades' => $this->habilidades,
            'competencias' => $this->competencias,
            'data_inicio' => $this->data_inicio?->toDateString(),
            'data_fim' => $this->data_fim?->toDateString(),
            'texto' => $this->texto,
            'usuario' => new UsuarioResource($this->whenLoaded('usuario')),
        ];
    }
}
