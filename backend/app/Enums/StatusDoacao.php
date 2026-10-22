<?php

namespace App\Enums;

enum StatusDoacao: string
{
    case Disponivel = 'disponivel';
    case Reservada = 'reservada';
    case Coletada = 'coletada';
    case Cancelada = 'cancelada';
}
