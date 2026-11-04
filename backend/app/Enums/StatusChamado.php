<?php

namespace App\Enums;

enum StatusChamado: string
{
    case Aberto = 'Aberto';
    case EmAtendimento = 'Em Atendimento';
    case Resolvido = 'Resolvido';
    case Cancelado = 'Cancelado';
}
