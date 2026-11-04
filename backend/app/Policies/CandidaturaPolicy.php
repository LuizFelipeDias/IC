<?php

namespace App\Policies;

use App\Models\Candidatura;
use App\Models\Usuario;

class CandidaturaPolicy
{
    /**
     * Mudança de status: quem decide é o dono da vaga, não o candidato.
     */
    public function update(Usuario $usuario, Candidatura $candidatura): bool
    {
        return $candidatura->vaga->id_usuario === $usuario->id;
    }

    /**
     * Desistência: apenas o próprio candidato.
     */
    public function delete(Usuario $usuario, Candidatura $candidatura): bool
    {
        return $candidatura->id_usuario === $usuario->id;
    }
}
