<?php

namespace App\Enums;

/**
 * Nível de experiência esperado do candidato.
 */
enum NivelVaga: string
{
    case Estagio = 'estagio';
    case Junior = 'junior';
    case Pleno = 'pleno';
    case Senior = 'senior';
    case NaoSeAplica = 'nao_se_aplica';

    public function rotulo(): string
    {
        return match ($this) {
            self::Estagio => 'Estágio',
            self::Junior => 'Júnior',
            self::Pleno => 'Pleno',
            self::Senior => 'Sênior',
            self::NaoSeAplica => 'Não se aplica',
        };
    }
}
