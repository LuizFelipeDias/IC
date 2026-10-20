<?php

namespace Tests\Support;

use Illuminate\Http\UploadedFile;
use ZipArchive;

/**
 * Arquivos reais (STL, 3MF, PDF) gerados para os testes de upload.
 */
final class ArquivosDeTeste
{
    /** Cubo de 10 mm (12 triângulos, normais para fora): volume de 1 cm³. */
    public static function cuboTriangulos(): array
    {
        $p = fn ($x, $y, $z) => [$x * 10, $y * 10, $z * 10];

        return [
            [$p(0, 0, 0), $p(0, 1, 0), $p(1, 1, 0)], [$p(0, 0, 0), $p(1, 1, 0), $p(1, 0, 0)],
            [$p(0, 0, 1), $p(1, 0, 1), $p(1, 1, 1)], [$p(0, 0, 1), $p(1, 1, 1), $p(0, 1, 1)],
            [$p(0, 0, 0), $p(1, 0, 0), $p(1, 0, 1)], [$p(0, 0, 0), $p(1, 0, 1), $p(0, 0, 1)],
            [$p(0, 1, 0), $p(0, 1, 1), $p(1, 1, 1)], [$p(0, 1, 0), $p(1, 1, 1), $p(1, 1, 0)],
            [$p(0, 0, 0), $p(0, 0, 1), $p(0, 1, 1)], [$p(0, 0, 0), $p(0, 1, 1), $p(0, 1, 0)],
            [$p(1, 0, 0), $p(1, 1, 0), $p(1, 1, 1)], [$p(1, 0, 0), $p(1, 1, 1), $p(1, 0, 1)],
        ];
    }

    public static function stlBinario(string $nome = 'cubo.stl'): UploadedFile
    {
        $triangulos = self::cuboTriangulos();
        $binario = str_pad('solid cubo binario', 80, "\0").pack('V', count($triangulos));
        foreach ($triangulos as [$a, $b, $c]) {
            $binario .= pack('g3', 0, 0, 0).pack('g9', ...$a, ...$b, ...$c).pack('v', 0);
        }

        return UploadedFile::fake()->createWithContent($nome, $binario);
    }

    public static function stlAscii(string $nome = 'cubo-ascii.stl'): UploadedFile
    {
        $texto = "solid cubo\n";
        foreach (self::cuboTriangulos() as $triangulo) {
            $texto .= "  facet normal 0 0 0\n    outer loop\n";
            foreach ($triangulo as [$x, $y, $z]) {
                $texto .= "      vertex {$x} {$y} {$z}\n";
            }
            $texto .= "    endloop\n  endfacet\n";
        }

        return UploadedFile::fake()->createWithContent($nome, $texto."endsolid cubo\n");
    }

    public static function arquivo3mf(?string $modelo = null, string $nome = 'cubo.3mf'): UploadedFile
    {
        $modelo ??= self::modelo3mfCubo();
        $caminho = tempnam(sys_get_temp_dir(), '3mf');

        $zip = new ZipArchive;
        $zip->open($caminho, ZipArchive::OVERWRITE);
        $zip->addFromString('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>');
        $zip->addFromString('3D/3dmodel.model', $modelo);
        $zip->close();

        return UploadedFile::fake()->createWithContent($nome, (string) file_get_contents($caminho));
    }

    /** 3MF cujo conteúdo descompactado é muito maior que o arquivo enviado. */
    public static function zipBomb3mf(): UploadedFile
    {
        $caminho = tempnam(sys_get_temp_dir(), 'bomb');
        $zip = new ZipArchive;
        $zip->open($caminho, ZipArchive::OVERWRITE);
        $zip->addFromString('[Content_Types].xml', '<Types/>');
        $zip->addFromString('3D/3dmodel.model', self::modelo3mfCubo());
        $zip->addFromString('3D/preenchimento.bin', str_repeat("\0", 20 * 1024 * 1024));
        $zip->close();

        return UploadedFile::fake()->createWithContent('bomba.3mf', (string) file_get_contents($caminho));
    }

    public static function modelo3mfCubo(string $unidade = 'millimeter'): string
    {
        $vertices = [];
        $indices = [];
        foreach (self::cuboTriangulos() as $triangulo) {
            $ids = [];
            foreach ($triangulo as $vertice) {
                $chave = implode(',', $vertice);
                $indices[$chave] ??= count($indices);
                $vertices[$indices[$chave]] = $vertice;
                $ids[] = $indices[$chave];
            }
            $tris[] = $ids;
        }

        $xmlVertices = implode('', array_map(fn ($v) => "<vertex x=\"{$v[0]}\" y=\"{$v[1]}\" z=\"{$v[2]}\"/>", $vertices));
        $xmlTriangulos = implode('', array_map(fn ($t) => "<triangle v1=\"{$t[0]}\" v2=\"{$t[1]}\" v3=\"{$t[2]}\"/>", $tris));

        return '<?xml version="1.0" encoding="UTF-8"?>'
            ."<model unit=\"{$unidade}\" xmlns=\"http://schemas.microsoft.com/3dmanufacturing/core/2015/02\">"
            ."<resources><object id=\"1\" type=\"model\"><mesh><vertices>{$xmlVertices}</vertices>"
            ."<triangles>{$xmlTriangulos}</triangles></mesh></object></resources>"
            .'<build><item objectid="1"/></build></model>';
    }

    public static function pdf(string $conteudoExtra = '', string $nome = 'laudo.pdf'): UploadedFile
    {
        $pdf = "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R {$conteudoExtra} >> endobj\n"
            ."2 0 obj << /Type /Pages /Kids [] /Count 0 >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF";

        return UploadedFile::fake()->createWithContent($nome, $pdf);
    }
}
