<?php

namespace App\Casts;

use App\Support\Etiquetas;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * Coluna JSON com lista de textos. Grava sem escapar acentos (ó), para
 * que a busca por "pós-processamento" funcione com LIKE no SQLite e no PostgreSQL.
 *
 * @implements CastsAttributes<list<string>, mixed>
 */
class ListaDeEtiquetas implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): array
    {
        if ($value === null || $value === '') {
            return [];
        }

        $lista = json_decode((string) $value, true);

        return is_array($lista) ? Etiquetas::normalizar($lista) : [];
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        $lista = Etiquetas::normalizar($value);

        return $lista === [] ? null : json_encode($lista, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
