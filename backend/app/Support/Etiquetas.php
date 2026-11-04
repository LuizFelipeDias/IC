<?php

namespace App\Support;

/**
 * Listas curtas de texto livre (habilidades da vaga, especialidades do currículo).
 *
 * Normaliza para busca e exibição: aceita lista ou texto separado por vírgulas,
 * apara espaços, junta espaços repetidos, descarta vazios e remove repetições
 * sem diferenciar maiúsculas/minúsculas (a primeira grafia é mantida).
 */
final class Etiquetas
{
    /**
     * @return list<string>
     */
    public static function normalizar(mixed $valor): array
    {
        if ($valor === null || $valor === '') {
            return [];
        }

        $itens = is_array($valor) ? $valor : explode(',', (string) $valor);
        $vistas = [];
        $resultado = [];

        foreach ($itens as $item) {
            if (! is_string($item) && ! is_numeric($item)) {
                continue;
            }

            $texto = trim(preg_replace('/\s+/u', ' ', (string) $item) ?? '');
            $chave = mb_strtolower($texto);

            if ($texto === '' || isset($vistas[$chave])) {
                continue;
            }

            $vistas[$chave] = true;
            $resultado[] = $texto;
        }

        return $resultado;
    }

    /**
     * Trecho de LIKE que encontra um item exato dentro da lista gravada em JSON
     * (as aspas delimitam o item: "FDM" não casa com "FDM industrial").
     * Use sempre com ESCAPE '!'.
     */
    public static function padraoItemExato(string $item): string
    {
        $json = json_encode(mb_strtolower(trim($item)), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        return '%'.self::escaparLike($json).'%';
    }

    public static function padraoContem(string $termo): string
    {
        return '%'.self::escaparLike(mb_strtolower(trim($termo))).'%';
    }

    /**
     * Escapa os curingas com "!" (use com ESCAPE '!'): a barra invertida confunde
     * o analisador de parâmetros do PDO no PostgreSQL.
     */
    private static function escaparLike(string $texto): string
    {
        return str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $texto);
    }
}
