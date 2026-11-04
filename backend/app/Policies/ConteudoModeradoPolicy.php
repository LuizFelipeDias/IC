<?php

namespace App\Policies;

use App\Models\Usuario;
use Illuminate\Database\Eloquent\Model;

/**
 * Notícias e projetos: o público só vê o que foi aprovado; autor e moderadores veem tudo.
 * Quem pode criar é definido pelo middleware "perfil" de cada rota.
 */
abstract class ConteudoModeradoPolicy
{
    /** Usuário opcional: a leitura também é feita por visitantes. */
    public function view(?Usuario $usuario, Model $conteudo): bool
    {
        return $conteudo->estaPublicado()
            || $conteudo->ehAutor($usuario)
            || (bool) $usuario?->ehModerador();
    }

    public function update(Usuario $usuario, Model $conteudo): bool
    {
        return $conteudo->ehAutor($usuario) || $usuario->ehModerador();
    }

    public function delete(Usuario $usuario, Model $conteudo): bool
    {
        return $this->update($usuario, $conteudo);
    }

    /** Moderador não aprova o próprio conteúdo. */
    public function moderar(Usuario $usuario, Model $conteudo): bool
    {
        return $usuario->ehModerador() && ! $conteudo->ehAutor($usuario);
    }
}
