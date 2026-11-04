<?php

namespace App\Services\Anexos;

use App\Jobs\VerificarAnexo;
use App\Models\AnexoDocumento;
use App\Models\Usuario;
use App\Support\Arquivos\Modelo3d;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Grava anexos em disco privado com nome aleatório e hash SHA-256, registra em
 * anexos_documentos e agenda a verificação de antivírus.
 *
 * O arquivo nunca fica acessível por URL direta: o download passa por link
 * temporário assinado (AnexoController).
 */
class ArmazenamentoAnexos
{
    public const DISCO = 'local';

    public function guardar(UploadedFile $arquivo, string $tipo, Model $anexavel, Usuario $usuario): AnexoDocumento
    {
        [$conteudo, $extensao, $mime, $metadados] = match ($tipo) {
            'imagem' => $this->prepararImagem($arquivo),
            'modelo' => $this->prepararModelo($arquivo),
            'laudo' => [file_get_contents($arquivo->getRealPath()), 'pdf', 'application/pdf', null],
        };

        $caminho = sprintf('anexos/%s/%s/%s.%s', $tipo, now()->format('Y/m'), Str::uuid(), $extensao);
        Storage::disk(self::DISCO)->put($caminho, $conteudo);

        $anexo = new AnexoDocumento([
            'nome_arquivo' => $this->nomeSeguro($arquivo->getClientOriginalName(), $extensao),
            'url_arquivo' => $caminho,
            'tipo_documento' => $tipo,
            'mime' => $mime,
            'tamanho_bytes' => strlen($conteudo),
            'sha256' => hash('sha256', $conteudo),
            'disco' => self::DISCO,
            'metadados' => $metadados,
        ]);
        $anexo->id_usuario = $usuario->id;
        $anexo->anexavel()->associate($anexavel);
        $anexo->save();

        VerificarAnexo::dispatch($anexo->id)->afterCommit();

        return $anexo->refresh();
    }

    public function remover(AnexoDocumento $anexo): void
    {
        Storage::disk($anexo->disco)->delete($anexo->url_arquivo);
        $anexo->delete();
    }

    /**
     * Reencoda a imagem em WebP: descarta metadados EXIF (inclusive localização GPS)
     * e qualquer conteúdo escondido após a imagem.
     */
    private function prepararImagem(UploadedFile $arquivo): array
    {
        $imagem = imagecreatefromstring((string) file_get_contents($arquivo->getRealPath()));

        ob_start();
        imagewebp($imagem, null, 82);
        $conteudo = (string) ob_get_clean();
        imagedestroy($imagem);

        return [$conteudo, 'webp', 'image/webp', null];
    }

    private function prepararModelo(UploadedFile $arquivo): array
    {
        $extensao = strtolower($arquivo->getClientOriginalExtension());
        $metadados = Modelo3d::analisar($arquivo->getRealPath(), $extensao);

        $mime = $extensao === '3mf' ? 'model/3mf' : 'model/stl';

        return [file_get_contents($arquivo->getRealPath()), $extensao, $mime, $metadados];
    }

    private function nomeSeguro(string $original, string $extensao): string
    {
        $base = Str::of(pathinfo($original, PATHINFO_FILENAME))->ascii()->replaceMatches('/[^A-Za-z0-9._ -]/', '')->trim()->limit(120, '');

        return ($base->isEmpty() ? 'arquivo' : (string) $base).'.'.$extensao;
    }
}
