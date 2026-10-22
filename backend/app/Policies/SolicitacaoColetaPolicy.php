<?php

namespace App\Policies;

use App\Enums\StatusColeta;
use App\Models\SolicitacaoColeta;
use App\Models\Usuario;

/**
 * Fluxo: laboratório solicita -> doador aceita/recusa -> agendamento -> laboratório conclui.
 */
class SolicitacaoColetaPolicy
{
    public function view(Usuario $usuario, SolicitacaoColeta $coleta): bool
    {
        return $this->ehLaboratorio($usuario, $coleta) || $this->ehDoador($usuario, $coleta) || $usuario->ehModerador();
    }

    public function aceitar(Usuario $usuario, SolicitacaoColeta $coleta): bool
    {
        return $this->ehDoador($usuario, $coleta) && $coleta->status === StatusColeta::Pendente;
    }

    public function recusar(Usuario $usuario, SolicitacaoColeta $coleta): bool
    {
        return $this->aceitar($usuario, $coleta);
    }

    public function agendar(Usuario $usuario, SolicitacaoColeta $coleta): bool
    {
        return ($this->ehDoador($usuario, $coleta) || $this->ehLaboratorio($usuario, $coleta))
            && in_array($coleta->status, [StatusColeta::Aceita, StatusColeta::Agendada], true);
    }

    public function concluir(Usuario $usuario, SolicitacaoColeta $coleta): bool
    {
        return $this->ehLaboratorio($usuario, $coleta)
            && in_array($coleta->status, [StatusColeta::Aceita, StatusColeta::Agendada], true);
    }

    public function cancelar(Usuario $usuario, SolicitacaoColeta $coleta): bool
    {
        return ($this->ehDoador($usuario, $coleta) || $this->ehLaboratorio($usuario, $coleta)) && $coleta->status->ativa();
    }

    private function ehLaboratorio(Usuario $usuario, SolicitacaoColeta $coleta): bool
    {
        return $coleta->id_laboratorio === $usuario->id;
    }

    private function ehDoador(Usuario $usuario, SolicitacaoColeta $coleta): bool
    {
        return $coleta->doacao->id_doador === $usuario->id;
    }
}
