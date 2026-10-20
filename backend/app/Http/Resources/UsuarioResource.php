<?php

namespace App\Http\Resources;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Perfil público: nunca expõe documentos, telefone ou e-mail.
 *
 * @mixin Usuario
 */
class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'profissao' => $this->profissao,
            'tipo' => $this->tipo(),
        ];
    }
}
