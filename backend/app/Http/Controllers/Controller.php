<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Itens por página pedidos pelo cliente (?per_page=), limitados a 100.
     */
    protected function porPagina(Request $request, int $padrao = 15): int
    {
        return max(1, min($request->integer('per_page', $padrao), 100));
    }
}
