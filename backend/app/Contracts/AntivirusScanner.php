<?php

namespace App\Contracts;

/**
 * Verificação de malware dos arquivos enviados.
 */
interface AntivirusScanner
{
    public const LIMPO = 'limpo';

    public const INFECTADO = 'infectado';

    /** Nenhum antivírus configurado ou serviço fora do ar. */
    public const INDISPONIVEL = 'indisponivel';

    public function verificar(string $caminhoAbsoluto): string;
}
