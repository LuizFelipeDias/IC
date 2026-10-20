<?php

namespace App\Http\Controllers;

use App\Models\Polimero;
use Illuminate\Support\Facades\Cache;

class PolimeroController extends Controller
{
    /**
     * Catálogo de referência, praticamente estático: cache de 1 dia.
     */
    public function index()
    {
        return response()->json([
            'data' => Cache::remember('polimeros', now()->addDay(), fn () => Polimero::orderBy('sigla')->get()),
        ]);
    }
}
