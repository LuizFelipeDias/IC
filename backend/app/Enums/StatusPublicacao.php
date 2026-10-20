<?php

namespace App\Enums;

enum StatusPublicacao: string
{
    case EmRevisao = 'em_revisao';
    case Publicado = 'publicado';
    case Rejeitado = 'rejeitado';
}
