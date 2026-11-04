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
            'cidade' => $this->cidade,
            'uf' => $this->uf,
            'disponibilidade' => $this->disponibilidade?->value,
            'disponibilidade_rotulo' => $this->disponibilidade?->rotulo(),
            'modalidade_preferida' => $this->modalidade_preferida?->value,
            'modalidade_preferida_rotulo' => $this->modalidade_preferida?->rotulo(),
            'portfolio_url' => $this->portfolio_url,
            'especialidades' => $this->especialidades,
            'visivel_no_banco' => $this->visivel_no_banco,
            'atualizado_em' => $this->updated_at,
            'usuario' => new UsuarioResource($this->whenLoaded('usuario')),
            // Quem consulta o banco (contratante verificado) precisa do e-mail para o contato.
            'contato' => $this->when(
                $this->relationLoaded('usuario') && $this->usuario !== null && $request->user()?->can('view', $this->resource),
                fn () => ['email' => $this->usuario->email],
            ),
        ];
    }
}
