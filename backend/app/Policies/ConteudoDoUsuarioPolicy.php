<?php

namespace App\Policies;

use App\Models\Usuario;
use Illuminate\Database\Eloquent\Model;

/**
 * Regra comum aos conteúdos que pertencem a um usuário (coluna id_usuario):
 * qualquer usuário autenticado pode criar; só o autor altera ou exclui.
 */
abstract class ConteudoDoUsuarioPolicy
{
    public function create(Usuario $usuario): bool
    {
        return true;
    }

    public function update(Usuario $usuario, Model $conteudo): bool
    {
        return $this->ehAutor($usuario, $conteudo);
    }

    public function delete(Usuario $usuario, Model $conteudo): bool
    {
        return $this->ehAutor($usuario, $conteudo);
    }

    protected function ehAutor(Usuario $usuario, Model $conteudo): bool
    {
        return (int) $conteudo->getAttribute('id_usuario') === $usuario->id;
    }
}
