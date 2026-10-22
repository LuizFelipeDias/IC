<?php

namespace App\Http\Resources;

use App\Models\Doacao;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Doacao */
class DoacaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_doador' => $this->id_doador,
            'tipo' => $this->tipo,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'peso_estimado_g' => $this->peso_estimado_g,
            'cor' => $this->cor,
            'cidade' => $this->cidade,
            'uf' => $this->uf,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'status' => $this->status?->value,
            'created_at' => $this->created_at,
            'polimero' => $this->whenLoaded('polimero', fn () => $this->polimero->only(['id', 'sigla', 'nome'])),
            'doador' => new UsuarioResource($this->whenLoaded('doador')),
            'fotos' => AnexoResource::collection($this->whenLoaded('anexos')),
        ];
    }
}
