<?php

namespace App\Support\Arquivos;

use XMLReader;
use ZipArchive;

/**
 * Lê modelos STL (binário ou ASCII) e 3MF, validando a estrutura real do arquivo
 * e calculando triângulos, volume e dimensões (usados no catálogo e no orçamento).
 *
 * Volume: soma dos volumes assinados dos tetraedros formados pela origem e cada
 * triângulo, |Σ v1 · (v2 × v3)| / 6, em mm³ (exato para malhas fechadas).
 */
final class Modelo3d
{
    public const MAX_TRIANGULOS = 5_000_000;

    /** Limites contra "zip bomb" em 3MF. */
    public const MAX_DESCOMPACTADO_BYTES = 200 * 1024 * 1024;

    public const MAX_TAXA_COMPRESSAO = 100;

    public const MAX_ENTRADAS_ZIP = 1000;

    /** Fatores de conversão das unidades do 3MF para milímetros. */
    private const UNIDADES_3MF = [
        'micron' => 0.001,
        'millimeter' => 1.0,
        'centimeter' => 10.0,
        'inch' => 25.4,
        'foot' => 304.8,
        'meter' => 1000.0,
    ];

    /**
     * @return array{formato: string, triangulos: int, volume_cm3: float, dimensoes_mm: array{x: float, y: float, z: float}}
     */
    /** Resultado por arquivo: a validação e o armazenamento leem o mesmo upload só uma vez. */
    private static array $cache = [];

    public static function analisar(string $caminho, string $extensao): array
    {
        $chave = $caminho.'|'.filesize($caminho).'|'.filemtime($caminho);

        return self::$cache[$chave] ??= match (strtolower($extensao)) {
            'stl' => self::analisarStl($caminho),
            '3mf' => self::analisar3mf($caminho),
            default => throw new ArquivoInvalido('Formato de modelo 3D não suportado.'),
        };
    }

    public static function analisarStl(string $caminho): array
    {
        $tamanho = filesize($caminho);

        if ($tamanho === false || $tamanho < 15) {
            throw new ArquivoInvalido('O arquivo STL está vazio ou incompleto.');
        }

        $arquivo = fopen($caminho, 'rb');
        $cabecalho = fread($arquivo, 84);
        $quantidade = strlen($cabecalho) === 84 ? unpack('V', substr($cabecalho, 80, 4))[1] : -1;

        // STL binário: 80 bytes de cabeçalho + 4 de contagem + 50 por triângulo.
        // Testado antes do ASCII porque cabeçalhos binários às vezes também começam com "solid".
        if ($quantidade > 0 && $tamanho === 84 + 50 * $quantidade) {
            if ($quantidade > self::MAX_TRIANGULOS) {
                fclose($arquivo);
                throw new ArquivoInvalido('O modelo excede o limite de '.number_format(self::MAX_TRIANGULOS, 0, ',', '.').' triângulos.');
            }

            $metricas = new MetricasMalha;
            for ($i = 0; $i < $quantidade; $i++) {
                $dados = unpack('g12', fread($arquivo, 50));
                $metricas->adicionarTriangulo(
                    [$dados[4], $dados[5], $dados[6]],
                    [$dados[7], $dados[8], $dados[9]],
                    [$dados[10], $dados[11], $dados[12]],
                );
            }
            fclose($arquivo);

            return $metricas->resultado('stl');
        }

        fclose($arquivo);

        if (! str_starts_with(ltrim($cabecalho), 'solid')) {
            throw new ArquivoInvalido('O arquivo não é um STL válido.');
        }

        return self::analisarStlAscii($caminho);
    }

    private static function analisarStlAscii(string $caminho): array
    {
        $metricas = new MetricasMalha;
        $vertices = [];
        $arquivo = fopen($caminho, 'rb');

        while (($linha = fgets($arquivo)) !== false) {
            if (preg_match('/^\s*vertex\s+(\S+)\s+(\S+)\s+(\S+)/i', $linha, $m)) {
                $vertices[] = [(float) $m[1], (float) $m[2], (float) $m[3]];

                if (count($vertices) === 3) {
                    $metricas->adicionarTriangulo(...$vertices);
                    $vertices = [];

                    if ($metricas->triangulos > self::MAX_TRIANGULOS) {
                        fclose($arquivo);
                        throw new ArquivoInvalido('O modelo excede o limite de triângulos.');
                    }
                }
            }
        }
        fclose($arquivo);

        if ($metricas->triangulos === 0) {
            throw new ArquivoInvalido('O arquivo STL não contém triângulos.');
        }

        return $metricas->resultado('stl');
    }

    public static function analisar3mf(string $caminho): array
    {
        $zip = new ZipArchive;

        if ($zip->open($caminho, ZipArchive::RDONLY) !== true) {
            throw new ArquivoInvalido('O arquivo 3MF não é um pacote ZIP válido.');
        }

        try {
            $modelo = self::validarPacote3mf($zip);
            $conteudo = $zip->getFromName($modelo);
        } finally {
            $zip->close();
        }

        if ($conteudo === false || $conteudo === '') {
            throw new ArquivoInvalido('O modelo 3D dentro do 3MF está vazio.');
        }

        // Sem DTD: impede XXE e expansão de entidades ("billion laughs").
        if (stripos($conteudo, '<!DOCTYPE') !== false || stripos($conteudo, '<!ENTITY') !== false) {
            throw new ArquivoInvalido('O 3MF contém declarações XML não permitidas.');
        }

        return self::lerMalha3mf($conteudo);
    }

    private static function validarPacote3mf(ZipArchive $zip): string
    {
        if ($zip->numFiles > self::MAX_ENTRADAS_ZIP) {
            throw new ArquivoInvalido('O 3MF contém arquivos demais.');
        }

        $descompactado = 0;
        $compactado = 0;
        $temTipos = false;
        $modelo = null;

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $info = $zip->statIndex($i);
            $descompactado += $info['size'];
            $compactado += $info['comp_size'];

            $nome = $info['name'];
            if (strcasecmp($nome, '[Content_Types].xml') === 0) {
                $temTipos = true;
            }
            if (preg_match('#^/?3D/[^/]+\.model$#i', $nome)) {
                $modelo ??= $nome;
            }
        }

        if ($descompactado > self::MAX_DESCOMPACTADO_BYTES
            || ($compactado > 0 && $descompactado / $compactado > self::MAX_TAXA_COMPRESSAO)) {
            throw new ArquivoInvalido('O 3MF excede os limites de descompactação permitidos.');
        }

        if (! $temTipos || $modelo === null) {
            throw new ArquivoInvalido('O arquivo não é um 3MF válido (faltam [Content_Types].xml ou 3D/*.model).');
        }

        return $modelo;
    }

    private static function lerMalha3mf(string $xml): array
    {
        $leitor = new XMLReader;
        if (! $leitor->XML($xml, null, LIBXML_NONET | LIBXML_COMPACT)) {
            throw new ArquivoInvalido('O XML do modelo 3MF é inválido.');
        }

        $metricas = new MetricasMalha;
        $escala = 1.0;
        $vertices = [];

        while (@$leitor->read()) {
            if ($leitor->nodeType !== XMLReader::ELEMENT) {
                continue;
            }

            switch ($leitor->localName) {
                case 'model':
                    $escala = self::UNIDADES_3MF[$leitor->getAttribute('unit') ?? 'millimeter'] ?? 1.0;
                    break;
                case 'mesh':
                    $vertices = [];
                    break;
                case 'vertex':
                    $vertices[] = [
                        (float) $leitor->getAttribute('x') * $escala,
                        (float) $leitor->getAttribute('y') * $escala,
                        (float) $leitor->getAttribute('z') * $escala,
                    ];
                    break;
                case 'triangle':
                    $a = $vertices[(int) $leitor->getAttribute('v1')] ?? null;
                    $b = $vertices[(int) $leitor->getAttribute('v2')] ?? null;
                    $c = $vertices[(int) $leitor->getAttribute('v3')] ?? null;

                    if ($a === null || $b === null || $c === null) {
                        throw new ArquivoInvalido('O 3MF referencia vértices inexistentes.');
                    }

                    $metricas->adicionarTriangulo($a, $b, $c);

                    if ($metricas->triangulos > self::MAX_TRIANGULOS) {
                        throw new ArquivoInvalido('O modelo excede o limite de triângulos.');
                    }
                    break;
            }
        }
        $leitor->close();

        if ($metricas->triangulos === 0) {
            throw new ArquivoInvalido('O 3MF não contém nenhuma malha com triângulos.');
        }

        return $metricas->resultado('3mf');
    }
}
