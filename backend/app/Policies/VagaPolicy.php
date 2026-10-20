<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Vaga;

class VagaPolicy extends ConteudoDoUsuarioPolicy
{
    /**
     * Lista de candidatos de uma vaga: visível apenas para quem a publicou.
     */
    public function verCandidaturas(Usuario $usuario, Vaga $vaga): bool
    {
        return $this->ehAutor($usuario, $vaga);
    }
}
