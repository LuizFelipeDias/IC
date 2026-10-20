<?php

namespace App\Enums;

/**
 * Onde o prestador realizará o atendimento; escolhido por ele ao aceitar o chamado.
 */
enum LocalAtendimento: string
{
    case InstituicaoSolicitante = 'instituicao_solicitante';
    case EspacoPrestador = 'espaco_prestador';
    case Remoto = 'remoto';

    public function rotulo(): string
    {
        return match ($this) {
            self::InstituicaoSolicitante => 'Na instituição solicitante',
            self::EspacoPrestador => 'No laboratório/espaço do prestador',
            self::Remoto => 'Remoto (online)',
        };
    }
}
