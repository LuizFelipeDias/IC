<?php

namespace App\Policies;

use App\Enums\StatusDoacao;
use App\Models\Doacao;
use App\Models\Usuario;

class DoacaoPolicy
{
    /** O mural de doações é aberto a qualquer usuário logado (e as fotos, aos visitantes). */
    public function view(?Usuario $usuario, Doacao $doacao): bool
    {
        return true;
    }

    /** Editar ou excluir só enquanto nenhum laboratório reservou a doação. */
    public function update(Usuario $usuario, Doacao $doacao): bool
    {
        return $doacao->id_doador === $usuario->id && $doacao->status === StatusDoacao::Disponivel;
    }

    public function delete(Usuario $usuario, Doacao $doacao): bool
    {
        return $this->update($usuario, $doacao);
    }
}
