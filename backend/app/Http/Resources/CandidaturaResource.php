<?php

namespace App\Http\Resources;

use App\Models\Candidatura;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Candidatura */
class CandidaturaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_usuario' => $this->id_usuario,
            'id_vaga' => $this->id_vaga,
            'status' => $this->status,
            'data_candidatura' => $this->data_candidatura,
            'vaga' => new VagaResource($this->whenLoaded('vaga')),
            // O dono da vaga precisa do e-mail para contatar o candidato.
            'usuario' => $this->whenLoaded('usuario', fn () => [
                'id' => $this->usuario->id,
                'nome' => $this->usuario->nome,
                'email' => $this->usuario->email,
            ]),
        ];
    }
}
