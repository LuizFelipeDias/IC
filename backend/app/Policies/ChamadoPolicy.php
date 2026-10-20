<?php

namespace App\Policies;

use App\Enums\Perfil;
use App\Enums\StatusChamado;
use App\Models\Chamado;
use App\Models\Usuario;

/**
 * Regras por registro. Quem pode usar cada rota (perfil) fica no middleware "perfil".
 */
class ChamadoPolicy
{
    public function view(Usuario $usuario, Chamado $chamado): bool
    {
        return $this->ehSolicitante($usuario, $chamado)
            || $chamado->id_prestador === $usuario->id
            || ($chamado->status === StatusChamado::Aberto && $usuario->temPerfil(Perfil::Prestador))
            || $usuario->ehModerador();
    }

    /** Edição e exclusão só enquanto ninguém aceitou o chamado. */
    public function update(Usuario $usuario, Chamado $chamado): bool
    {
        return $this->ehSolicitante($usuario, $chamado) && $chamado->status === StatusChamado::Aberto;
    }

    public function delete(Usuario $usuario, Chamado $chamado): bool
    {
        return $this->update($usuario, $chamado);
    }

    public function aceitar(Usuario $usuario, Chamado $chamado): bool
    {
        return $usuario->temPerfil(Perfil::Prestador)
            && $chamado->status === StatusChamado::Aberto
            && ! $this->ehSolicitante($usuario, $chamado);
    }

    public function concluir(Usuario $usuario, Chamado $chamado): bool
    {
        return $chamado->id_prestador === $usuario->id && $chamado->status === StatusChamado::EmAtendimento;
    }

    public function cancelar(Usuario $usuario, Chamado $chamado): bool
    {
        return $this->ehSolicitante($usuario, $chamado)
            && in_array($chamado->status, [StatusChamado::Aberto, StatusChamado::EmAtendimento], true);
    }

    private function ehSolicitante(Usuario $usuario, Chamado $chamado): bool
    {
        return $chamado->id_usuario === $usuario->id;
    }
}
