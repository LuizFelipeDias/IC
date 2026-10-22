<?php

namespace App\Enums;

/**
 * Áreas do catálogo do "Repositório de projetos" previstas nos requisitos.
 */
enum AreaProjeto: string
{
    case Saude = 'saude';
    case Educacao = 'educacao';
    case Agro = 'agro';
    case Acessibilidade = 'acessibilidade';
    case Outro = 'outro';
}
