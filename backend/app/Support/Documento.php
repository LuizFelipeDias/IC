<?php

namespace App\Support;

/**
 * CPF e CNPJ: validação dos dígitos verificadores, formatação e geração (para testes e seeds).
 */
final class Documento
{
    public static function somenteDigitos(?string $valor): string
    {
        return preg_replace('/\D/', '', (string) $valor);
    }

    public static function cpfValido(?string $cpf): bool
    {
        $digitos = self::somenteDigitos($cpf);

        if (strlen($digitos) !== 11 || preg_match('/^(\d)\1{10}$/', $digitos)) {
            return false;
        }

        return substr($digitos, 9, 2) === self::digitosCpf(substr($digitos, 0, 9));
    }

    public static function cnpjValido(?string $cnpj): bool
    {
        $digitos = self::somenteDigitos($cnpj);

        if (strlen($digitos) !== 14 || preg_match('/^(\d)\1{13}$/', $digitos)) {
            return false;
        }

        return substr($digitos, 12, 2) === self::digitosCnpj(substr($digitos, 0, 12));
    }

    public static function formatarCpf(string $cpf): string
    {
        return preg_replace('/^(\d{3})(\d{3})(\d{3})(\d{2})$/', '$1.$2.$3-$4', self::somenteDigitos($cpf));
    }

    public static function formatarCnpj(string $cnpj): string
    {
        return preg_replace('/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/', '$1.$2.$3/$4-$5', self::somenteDigitos($cnpj));
    }

    public static function gerarCpf(): string
    {
        $base = self::aleatorio(9);

        return self::formatarCpf($base.self::digitosCpf($base));
    }

    public static function gerarCnpj(): string
    {
        $base = self::aleatorio(8).'0001';

        return self::formatarCnpj($base.self::digitosCnpj($base));
    }

    private static function digitosCpf(string $base): string
    {
        foreach ([10, 11] as $pesoInicial) {
            $soma = 0;
            foreach (str_split($base) as $i => $digito) {
                $soma += (int) $digito * ($pesoInicial - $i);
            }
            $resto = $soma % 11;
            $base .= $resto < 2 ? '0' : (string) (11 - $resto);
        }

        return substr($base, -2);
    }

    private static function digitosCnpj(string $base): string
    {
        foreach ([[5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]] as $pesos) {
            $soma = 0;
            foreach ($pesos as $i => $peso) {
                $soma += (int) $base[$i] * $peso;
            }
            $resto = $soma % 11;
            $base .= $resto < 2 ? '0' : (string) (11 - $resto);
        }

        return substr($base, -2);
    }

    private static function aleatorio(int $tamanho): string
    {
        $numero = '';
        for ($i = 0; $i < $tamanho; $i++) {
            $numero .= (string) random_int(0, 9);
        }

        return $numero;
    }
}
