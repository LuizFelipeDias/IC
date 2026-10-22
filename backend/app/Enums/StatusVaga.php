<?php

namespace App\Enums;

/**
 * Vagas encerradas saem do mural e não recebem novas candidaturas.
 */
enum StatusVaga: string
{
    case Aberta = 'aberta';
    case Encerrada = 'encerrada';

    public function rotulo(): string
    {
        return match ($this) {
            self::Aberta => 'Aberta',
            self::Encerrada => 'Encerrada',
        };
    }
}
