<?php

namespace App\Enums;

enum MotivoDenuncia: string
{
    case PecaPerigosa = 'peca_perigosa';
    case LicencaViolada = 'licenca_violada';
    case ConteudoOfensivo = 'conteudo_ofensivo';
    case Spam = 'spam';
    case Outro = 'outro';
}
