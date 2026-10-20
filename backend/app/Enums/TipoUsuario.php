<?php

namespace App\Enums;

enum TipoUsuario: string
{
    case PessoaFisica = 'pessoa_fisica';
    case Empresa = 'empresa';
    case Escola = 'escola';
    case Laboratorio = 'laboratorio';

    public function ehPessoaJuridica(): bool
    {
        return $this !== self::PessoaFisica;
    }

    public function rotulo(): string
    {
        return match ($this) {
            self::PessoaFisica => 'Pessoa física',
            self::Empresa => 'Empresa',
            self::Escola => 'Escola',
            self::Laboratorio => 'Laboratório',
        };
    }
}
