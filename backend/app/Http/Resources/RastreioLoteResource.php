<?php

namespace App\Http\Resources;

use App\Models\LoteFilamento;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Página pública do QR Code: dados técnicos e cadeia de origem do lote,
 * sem nenhum dado pessoal dos doadores.
 *
 * @mixin LoteFilamento
 */
class RastreioLoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $doacoes = $this->coletas->map->doacao;

        return [
            'codigo' => $this->codigo,
            'status' => $this->status,
            'polimero' => $this->polimero->only(['sigla', 'nome']),
            'cor' => $this->cor,
            'diametro_nominal_mm' => $this->diametro_nominal_mm,
            'peso_entrada_g' => $this->peso_entrada_g,
            'peso_saida_g' => $this->peso_saida_g,
            'produzido_em' => $this->produzido_em,
            'laboratorio' => ['nome' => $this->laboratorio?->nome],
            'origem' => [
                'doacoes' => $doacoes->count(),
                'peso_reciclado_g' => (int) $this->coletas->sum('pivot.peso_g'),
                'por_tipo' => $doacoes->countBy('tipo'),
                'cidades' => $doacoes->pluck('cidade')->filter()->unique()->values(),
            ],
            'eventos' => $this->eventos->map(fn ($evento) => [
                'tipo' => $evento->tipo,
                'descricao' => $evento->descricao,
                'ocorrido_em' => $evento->ocorrido_em,
            ]),
            'laudos' => $this->laudos->map(fn ($laudo) => [
                'resultado' => $laudo->resultado,
                'emitido_em' => $laudo->emitido_em,
                'laboratorio' => $laudo->laboratorio?->nome,
                'diametro_medio_mm' => $laudo->diametro_medio_mm,
                'tolerancia_mm' => $laudo->tolerancia_mm,
                'resistencia_tracao_mpa' => $laudo->resistencia_tracao_mpa,
                'temp_impressao' => [$laudo->temp_impressao_min, $laudo->temp_impressao_max],
            ]),
        ];
    }
}
