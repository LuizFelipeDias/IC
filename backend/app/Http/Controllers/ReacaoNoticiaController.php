<?php

namespace App\Http\Controllers;

use App\Models\Noticia;
use App\Models\ReacaoNoticia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * Reações e comentários curtos em notícias publicadas (tabela legada reacoes_noticias).
 */
class ReacaoNoticiaController extends Controller
{
    public function index(Request $request, Noticia $noticia)
    {
        Gate::forUser($request->user('sanctum'))->authorize('view', $noticia);

        $reacoes = $noticia->reacoes()
            ->with('usuario:id,nome')
            ->latest('data_reacao')
            ->paginate($this->porPagina($request));

        return response()->json([
            'totais' => $noticia->reacoes()->toBase()
                ->selectRaw('tipo_reacao, count(*) as total')
                ->groupBy('tipo_reacao')
                ->pluck('total', 'tipo_reacao'),
            'reacoes' => $reacoes,
        ]);
    }

    /**
     * Uma reação por usuário e notícia (UNIQUE no banco): reenviar substitui a anterior.
     */
    public function salvar(Request $request, Noticia $noticia)
    {
        abort_unless($noticia->estaPublicado(), 404);

        $dados = $request->validate([
            'tipo_reacao' => ['required', Rule::in(ReacaoNoticia::TIPOS)],
            'comentarios' => ['nullable', 'string', 'max:255'],
        ]);

        $reacao = ReacaoNoticia::updateOrCreate(
            ['id_noticia' => $noticia->id, 'id_usuario' => $request->user()->id],
            $dados,
        );

        return response()->json($reacao->refresh(), $reacao->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request, Noticia $noticia)
    {
        $noticia->reacoes()->where('id_usuario', $request->user()->id)->delete();

        return response()->noContent();
    }
}
