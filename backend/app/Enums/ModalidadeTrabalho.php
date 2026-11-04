<?php

namespace App\Enums;

/**
 * Onde o trabalho da vaga acontece.
 */
enum ModalidadeTrabalho: string
{
    case Presencial = 'presencial';
    case Remoto = 'remoto';
    case Hibrido = 'hibrido';

    public function rotulo(): string
    {
        return match ($this) {
            self::Presencial => 'Presencial',
            self::Remoto => 'Remoto',
            self::Hibrido => 'Híbrido',
        };
    }
}
