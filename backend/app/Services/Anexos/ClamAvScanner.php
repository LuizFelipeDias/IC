<?php

namespace App\Services\Anexos;

use App\Contracts\AntivirusScanner;

/**
 * Cliente do daemon ClamAV (clamd) pelo protocolo INSTREAM via TCP.
 */
class ClamAvScanner implements AntivirusScanner
{
    public function __construct(
        private string $host,
        private int $porta,
        private int $timeoutSegundos = 30,
    ) {}

    public function verificar(string $caminhoAbsoluto): string
    {
        $socket = @stream_socket_client("tcp://{$this->host}:{$this->porta}", $erro, $mensagem, $this->timeoutSegundos);

        if ($socket === false) {
            return self::INDISPONIVEL;
        }

        stream_set_timeout($socket, $this->timeoutSegundos);
        fwrite($socket, "zINSTREAM\0");

        $arquivo = fopen($caminhoAbsoluto, 'rb');
        while (! feof($arquivo)) {
            $bloco = fread($arquivo, 8192);
            fwrite($socket, pack('N', strlen($bloco)).$bloco);
        }
        fclose($arquivo);
        fwrite($socket, pack('N', 0));

        $resposta = trim((string) stream_get_contents($socket));
        fclose($socket);

        return match (true) {
            str_ends_with($resposta, 'OK') => self::LIMPO,
            str_contains($resposta, 'FOUND') => self::INFECTADO,
            default => self::INDISPONIVEL,
        };
    }
}
