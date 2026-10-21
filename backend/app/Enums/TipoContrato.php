<?php

namespace App\Enums;

/**
 * Forma de contratação oferecida na vaga.
 */
enum TipoContrato: string
{
    case Clt = 'clt';
    case Estagio = 'estagio';
    case Bolsa = 'bolsa';
    case Pj = 'pj';
    case Temporario = 'temporario';
    case Voluntario = 'voluntario';

    public function rotulo(): string
    {
        return match ($this) {
            self::Clt => 'CLT',
            self::Estagio => 'Estágio',
            self::Bolsa => 'Bolsa (pesquisa/extensão)',
            self::Pj => 'PJ',
            self::Temporario => 'Temporário',
            self::Voluntario => 'Voluntário',
        };
    }
}
