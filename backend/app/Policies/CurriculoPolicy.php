<?php

namespace App\Policies;

use App\Models\Curriculo;
use App\Models\Usuario;

class CurriculoPolicy extends ConteudoDoUsuarioPolicy
{
    /**
     * Currículo contém dados pessoais: só o dono e empresas podem ver.
     */
    public function view(Usuario $usuario, Curriculo $curriculo): bool
    {
        return $usuario->empresa || $this->ehAutor($usuario, $curriculo);
    }
}
