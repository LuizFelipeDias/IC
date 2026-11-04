<?php

namespace App\Enums;

/**
 * Papel administrativo, independente do tipo de usuário.
 * Só é alterado diretamente no banco ou por um administrador.
 */
enum PapelUsuario: string
{
    case Usuario = 'usuario';
    case Moderador = 'moderador';
    case Admin = 'admin';
}
