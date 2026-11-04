<?php

namespace App\Enums;

/**
 * Modalidade de trabalho que o candidato prefere; "qualquer" aparece em todas as buscas por modalidade.
 */
enum ModalidadePreferida: string
{
    case Presencial = 'presencial';
    case Remoto = 'remoto';
    case Hibrido = 'hibrido';
    case Qualquer = 'qualquer';

    public function rotulo(): string
    {
        return match ($this) {
            self::Presencial => 'Presencial',
            self::Remoto => 'Remoto',
            self::Hibrido => 'Híbrido',
            self::Qualquer => 'Qualquer modalidade',
        };
    }
}
