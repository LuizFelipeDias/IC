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
        $usuario = $request->user('sanctum');

        return [
            'id' => $this->id,
            'id_usuario' => $this->id_usuario,
            'titulo' => $this->titulo,
            'tema' => $this->tema,
            'area' => $this->area?->value,
            'licenca' => $this->licenca?->value,
            'empresa' => $this->empresa,
            'texto' => $this->texto,
            'status' => $this->status?->value,
            'data_publicacao' => $this->data_publicacao,
            'motivo_rejeicao' => $this->when($this->ehAutor($usuario) || $usuario?->ehModerador(), $this->motivo_rejeicao),
            'moderado_em' => $this->moderado_em,
            'usuario' => new UsuarioResource($this->whenLoaded('usuario')),
        ];
    }
}
