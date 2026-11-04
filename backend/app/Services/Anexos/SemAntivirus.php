<?php

namespace App\Services\Anexos;

use App\Contracts\AntivirusScanner;

/**
 * Usado quando ANTIVIRUS_DRIVER=nenhum: o anexo fica com verificação "pendente".
 */
class SemAntivirus implements AntivirusScanner
{
    public function verificar(string $caminhoAbsoluto): string
    {
        return self::INDISPONIVEL;
    }
}
