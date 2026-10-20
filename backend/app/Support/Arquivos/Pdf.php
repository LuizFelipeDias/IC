<?php

namespace App\Support\Arquivos;

/**
 * Verificação de laudos em PDF: assinatura real e ausência de conteúdo ativo.
 */
final class Pdf
{
    /**
     * Scripts, execução de programas e mídia embutida. /OpenAction não entra:
     * editores comuns (Word, LibreOffice) o usam só para definir o zoom inicial.
     * Objetos compactados podem esconder marcadores; o antivírus complementa a checagem.
     */
    private const MARCADORES_PERIGOSOS = ['/JavaScript', '/JS', '/Launch', '/RichMedia'];

    public static function validar(string $caminho): void
    {
        $arquivo = fopen($caminho, 'rb');
        $inicio = fread($arquivo, 1024);
        fclose($arquivo);

        if (! str_contains((string) $inicio, '%PDF-')) {
            throw new ArquivoInvalido('O arquivo não é um PDF válido.');
        }

        $conteudo = (string) file_get_contents($caminho);

        foreach (self::MARCADORES_PERIGOSOS as $marcador) {
            // O nome precisa terminar ali (ex.: "/JS" não pode casar com "/JSON").
            if (preg_match('#'.preg_quote($marcador, '#').'(?![A-Za-z0-9])#', $conteudo)) {
                throw new ArquivoInvalido('O PDF contém ações automáticas ou scripts, que não são permitidos em laudos.');
            }
        }
    }
}
