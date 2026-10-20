<?php

namespace App\Policies;

use App\Enums\Perfil;
use App\Models\Curriculo;
use App\Models\Usuario;

class CurriculoPolicy extends ConteudoDoUsuarioPolicy
{
    /**
     * Currículo contém dados pessoais: só o dono e instituições verificadas que contratam podem ver.
     */
    public function view(Usuario $usuario, Curriculo $curriculo): bool
    {
        return $usuario->temPerfil(Perfil::Contratante) || $this->ehAutor($usuario, $curriculo);
    }
}
