<?php

namespace App\Http\Resources;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Dados completos do próprio usuário autenticado (GET /usuario/me).
 *
 * @mixin Usuario
 */
class UsuarioPrivadoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'email' => $this->email,
            'telefone' => $this->telefone,
            'estudante' => $this->estudante,
            'empresa' => $this->empresa,
            'tipo' => $this->tipo_usuario->value,
            'tipo_usuario' => $this->tipo_usuario->value,
            'prestador_servico' => $this->prestador_servico,
            'papel' => $this->papel->value,
            'codigo_inep' => $this->codigo_inep,
            'perfis' => $this->perfis(),
            'pontos_total' => $this->pontos_total,
            'cpf' => $this->cpf,
            'cnpj' => $this->cnpj,
            'sexo' => $this->sexo,
            'profissao' => $this->profissao,
            'created_at' => $this->created_at,
        ];
    }
}
