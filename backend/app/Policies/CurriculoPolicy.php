<?php

namespace App\Policies;

use App\Enums\Perfil;
use App\Models\Curriculo;
use App\Models\Usuario;

class CurriculoPolicy extends ConteudoDoUsuarioPolicy
{
    /**
     * Currículo contém dados pessoais: o dono sempre vê o próprio; instituições
     * verificadas que contratam veem apenas os marcados como visíveis no banco.
     */
    public function view(Usuario $usuario, Curriculo $curriculo): bool
    {
        return $this->ehAutor($usuario, $curriculo)
            || ($usuario->temPerfil(Perfil::Contratante) && $curriculo->visivel_no_banco);
    }
}
