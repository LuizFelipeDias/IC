<?php

namespace App\Http\Resources;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Cartão público de uma instituição verificada. Sem CNPJ, e-mail ou telefone.
 *
 * @mixin Usuario
 */
class InstituicaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'tipo' => $this->tipo_usuario->value,
            'tipo_rotulo' => $this->tipo_usuario->rotulo(),
            'verificado_em' => $this->verificado_em,
            'pontos' => $this->pontos_total,
            'numeros' => [
                'vagas' => $this->vagas_count ?? 0,
                'projetos_publicados' => $this->projetos_publicados_count ?? 0,
                'chamados_abertos' => $this->chamados_abertos_count ?? 0,
                'chamados_resolvidos' => $this->chamados_resolvidos_count ?? 0,
                'lotes' => $this->lotes_count ?? 0,
            ],
        ];
    }
}
