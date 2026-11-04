<?php

namespace App\Jobs;

use App\Contracts\AntivirusScanner;
use App\Models\AnexoDocumento;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

/**
 * Passa o anexo no antivírus fora da requisição. Arquivo infectado é apagado.
 */
class VerificarAnexo implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public int $idAnexo) {}

    public function handle(AntivirusScanner $antivirus): void
    {
        $anexo = AnexoDocumento::find($this->idAnexo);

        if ($anexo === null) {
            return;
        }

        $disco = Storage::disk($anexo->disco);

        $resultado = $antivirus->verificar($disco->path($anexo->url_arquivo));

        if ($resultado === AntivirusScanner::INFECTADO) {
            $disco->delete($anexo->url_arquivo);
        }

        $anexo->forceFill([
            'status_verificacao' => match ($resultado) {
                AntivirusScanner::LIMPO => 'aprovado',
                AntivirusScanner::INFECTADO => 'rejeitado',
                default => 'pendente',
            },
        ])->save();
    }
}
