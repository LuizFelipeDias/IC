<?php

namespace App\Http\Resources;

use App\Models\SolicitacaoColeta;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin SolicitacaoColeta */
class ColetaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $usuario = $request->user();
        $aceita = ! in_array($this->status?->value, ['pendente', 'recusada', 'cancelada'], true);

        return [
            'id' => $this->id,
            'id_doacao' => $this->id_doacao,
            'id_laboratorio' => $this->id_laboratorio,
            'modalidade' => $this->modalidade,
            'status' => $this->status?->value,
            'agendado_para' => $this->agendado_para,
            'peso_recebido_g' => $this->peso_recebido_g,
            'observacoes' => $this->observacoes,
            'concluida_em' => $this->concluida_em,
            'created_at' => $this->created_at,
            'doacao' => new DoacaoResource($this->whenLoaded('doacao')),
            'laboratorio' => new UsuarioResource($this->whenLoaded('laboratorio')),
            // Contato liberado só depois do aceite, e só para as duas partes.
            'contato' => $this->when($aceita && $usuario !== null && $this->relationLoaded('doacao'), fn () => [
                'laboratorio' => ['email' => $this->laboratorio?->email, 'telefone' => $this->laboratorio?->telefone],
                'doador' => ['email' => $this->doacao->doador?->email, 'telefone' => $this->doacao->doador?->telefone],
            ]),
        ];
    }
}
