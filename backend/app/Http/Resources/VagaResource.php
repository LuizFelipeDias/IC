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
        $situacao = $this->situacao();

        return [
            'id' => $this->id,
            'id_usuario' => $this->id_usuario,
            'titulo' => $this->titulo,
            'tema' => $this->tema,
            'cep' => $this->cep,
            'cidade' => $this->cidade,
            'uf' => $this->uf,
            'texto' => $this->texto,
            'modalidade' => $this->modalidade?->value,
            'modalidade_rotulo' => $this->modalidade?->rotulo(),
            'tipo_contrato' => $this->tipo_contrato?->value,
            'tipo_contrato_rotulo' => $this->tipo_contrato?->rotulo(),
            'nivel' => $this->nivel?->value,
            'nivel_rotulo' => $this->nivel?->rotulo(),
            // A faixa salarial é opcional: só sai na resposta quando informada.
            'salario_min' => $this->when($this->salario_min !== null, fn () => (float) $this->salario_min),
            'salario_max' => $this->when($this->salario_max !== null, fn () => (float) $this->salario_max),
            'habilidades' => $this->habilidades,
            'status' => $situacao->value,
            'status_rotulo' => $situacao->rotulo(),
            'aceita_candidaturas' => $situacao->value === 'aberta',
            'encerra_em' => $this->encerra_em?->toDateString(),
            'encerrada_em' => $this->encerrada_em,
            'data_publicacao' => $this->data_publicacao,
            'usuario' => new UsuarioResource($this->whenLoaded('usuario')),
            'candidaturas_count' => $this->whenCounted('candidaturas'),
        ];
    }
}
