<?php

namespace App\Http\Resources;

use App\Models\LoteFilamento;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin LoteFilamento */
class LoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'status' => $this->status,
            'peso_entrada_g' => $this->peso_entrada_g,
            'peso_saida_g' => $this->peso_saida_g,
            'diametro_nominal_mm' => $this->diametro_nominal_mm,
            'cor' => $this->cor,
            'produzido_em' => $this->produzido_em,
            'created_at' => $this->created_at,
            'polimero' => $this->whenLoaded('polimero', fn () => $this->polimero->only(['id', 'sigla', 'nome'])),
            'coletas' => $this->whenLoaded('coletas', fn () => $this->coletas->map(fn ($coleta) => [
                'id' => $coleta->id,
                'peso_g' => $coleta->pivot->peso_g,
                'doacao' => $coleta->doacao?->only(['id', 'titulo', 'tipo', 'cidade']),
            ])),
            'eventos' => $this->whenLoaded('eventos', fn () => $this->eventos->map->only(['id', 'tipo', 'descricao', 'ocorrido_em'])),
            'laudos' => $this->whenLoaded('laudos', fn () => $this->laudos->map(fn ($laudo) => [
                ...$laudo->only(['id', 'resultado', 'diametro_medio_mm', 'tolerancia_mm', 'resistencia_tracao_mpa', 'temp_impressao_min', 'temp_impressao_max', 'emitido_em']),
                'id_anexo' => $laudo->id_anexo,
            ])),
        ];
    }
}
