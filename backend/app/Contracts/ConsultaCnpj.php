<?php

namespace App\Contracts;

/**
 * Consulta a situação cadastral de um CNPJ em uma base pública.
 */
interface ConsultaCnpj
{
    /**
     * @return array{razao_social: string, situacao: string, municipio: ?string, uf: ?string, abertura: ?string}|null
     *                                                                                                                null quando o CNPJ não é encontrado ou o serviço está indisponível
     */
    public function consultar(string $cnpj): ?array;
}
