<?php

namespace App\Http\Controllers;

use App\Enums\TipoUsuario;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Ranking público de makers, laboratórios e demais participantes.
 */
class RankingController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate(['tipo' => ['nullable', Rule::enum(TipoUsuario::class)]]);

        $usuarios = Usuario::query()
            ->select(['id', 'nome', 'tipo_usuario', 'pontos_total'])
            ->with('selos:id,slug,nome')
            ->where('pontos_total', '>', 0)
            ->when($request->filled('tipo'), fn ($query) => $query->where('tipo_usuario', $request->input('tipo')))
            ->orderByDesc('pontos_total')
            ->orderBy('id')
            ->limit(20)
            ->get();

        return response()->json([
            'data' => $usuarios->values()->map(fn (Usuario $usuario, int $posicao) => [
                'posicao' => $posicao + 1,
                'id' => $usuario->id,
                'nome' => $usuario->nome,
                'tipo' => $usuario->tipo_usuario->value,
                'pontos' => $usuario->pontos_total,
                'selos' => $usuario->selos->map->only(['slug', 'nome']),
            ]),
        ]);
    }
}
