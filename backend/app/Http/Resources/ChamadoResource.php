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
        $usuarioId = $request->user()?->id;
        $envolvido = in_array($usuarioId, [$this->id_usuario, $this->id_prestador], true);

        return [
            'id' => $this->id,
            'id_usuario' => $this->id_usuario,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'status' => $this->status?->value,
            'tipo_servico' => $this->tipo_servico?->value,
            'tipo_servico_rotulo' => $this->tipo_servico?->rotulo(),
            'cidade' => $this->cidade,
            'uf' => $this->uf,
            'data_criacao' => $this->data_criacao,
            'data_limite' => $this->data_limite?->toDateString(),
            'id_prestador' => $this->id_prestador,
            'local_atendimento' => $this->local_atendimento?->value,
            'local_atendimento_rotulo' => $this->local_atendimento?->rotulo(),
            'aceito_em' => $this->aceito_em,
            'concluido_em' => $this->concluido_em,
            'usuario' => new UsuarioResource($this->whenLoaded('usuario')),
            'prestador' => new UsuarioResource($this->whenLoaded('prestador')),
            // Contato só para quem participa do atendimento.
            'contato' => $this->when($envolvido && $this->id_prestador !== null, fn () => [
                'solicitante' => ['email' => $this->usuario?->email, 'telefone' => $this->usuario?->telefone],
                'prestador' => ['email' => $this->prestador?->email, 'telefone' => $this->prestador?->telefone],
            ]),
        ];
    }
}
