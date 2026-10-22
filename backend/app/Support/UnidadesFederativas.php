<?php

namespace App\Support;

/**
 * Siglas das 27 unidades federativas, usadas para validar e normalizar a UF de vagas e currículos.
 */
final class UnidadesFederativas
{
    public const SIGLAS = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
        'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
    ];

    /** " pr " -> "PR"; valores que não são texto voltam como vieram para a validação recusar. */
    public static function normalizar(mixed $uf): mixed
    {
        return is_string($uf) ? mb_strtoupper(trim($uf)) : $uf;
    }

    public static function valida(mixed $uf): bool
    {
        return is_string($uf) && in_array($uf, self::SIGLAS, true);
    }
}
