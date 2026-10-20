<?php

namespace App\Enums;

enum StatusColeta: string
{
    case Pendente = 'pendente';
    case Aceita = 'aceita';
    case Recusada = 'recusada';
    case Agendada = 'agendada';
    case Concluida = 'concluida';
    case Cancelada = 'cancelada';

    /** Solicitação em andamento: bloqueia a doação para outros laboratórios. */
    public function ativa(): bool
    {
        return in_array($this, [self::Pendente, self::Aceita, self::Agendada], true);
    }
}
