<?php

namespace App\Enums;

/**
 * Quando o candidato pode começar.
 */
enum Disponibilidade: string
{
    case Imediata = 'imediata';
    case TrintaDias = '30_dias';
    case ACombinar = 'a_combinar';

    public function rotulo(): string
    {
        return match ($this) {
            self::Imediata => 'Imediata',
            self::TrintaDias => 'Em até 30 dias',
            self::ACombinar => 'A combinar',
        };
    }
}
