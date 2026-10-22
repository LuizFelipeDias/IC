<?php

namespace App\Http\Controllers;

use App\Enums\StatusPublicacao;
use App\Http\Requests\ModeracaoRequest;
use App\Http\Requests\NoticiaRequest;
use App\Http\Resources\NoticiaResource;
use App\Models\Noticia;
use App\Services\ModeracaoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class NoticiaController extends Controller
{
    /**
     * Público: só notícias aprovadas. Moderadores podem filtrar por ?status=.
     */
    public function index(Request $request)
    {
        $request->validate([
            'status' => ['nullable', Rule::enum(StatusPublicacao::class)],
            'tema' => ['nullable', 'string', 'max:100'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $moderador = (bool) $request->user('sanctum')?->ehModerador();

        $noticias = Noticia::with('usuario')
            ->withCount('reacoes')
            ->when(
                $moderador && $request->filled('status'),
                fn ($query) => $query->where('status', $request->input('status')),
                fn ($query) => $query->publicados(),
            )
            ->when($request->filled('tema'), fn ($query) => $query->where('tema', $request->input('tema')))
            ->when($request->filled('q'), fn ($query) => $query->whereLike('titulo', '%'.$request->input('q').'%'))
            ->orderByDesc('data_publicacao')
            ->paginate($this->porPagina($request));

        return NoticiaResource::collection($noticias);
    }

    /**
     * Notícias do autor em qualquer status (acompanhamento da revisão).
     */
    public function minhas(Request $request)
    {
        $noticias = $request->user()->noticias()
            ->latest()
            ->paginate($this->porPagina($request));

        return NoticiaResource::collection($noticias);
    }

    public function show(Request $request, Noticia $noticia)
    {
        Gate::forUser($request->user('sanctum'))->authorize('view', $noticia);

        return new NoticiaResource($noticia->load('usuario')->loadCount('reacoes'));
    }

    /**
     * Notícia de moderador já nasce publicada; as demais aguardam revisão.
     */
    public function store(NoticiaRequest $request, ModeracaoService $moderacao)
    {
        $usuario = $request->user();
        $noticia = $usuario->noticias()->create($request->validated());

        if ($usuario->ehModerador()) {
            $moderacao->aprovar($noticia, $usuario);
        }

        return (new NoticiaResource($noticia->refresh()))->response()->setStatusCode(201);
    }

    /**
     * Edição do autor volta para revisão, para não alterar texto já aprovado sem curadoria.
     */
    public function update(NoticiaRequest $request, Noticia $noticia)
    {
        Gate::authorize('update', $noticia);

        $noticia->fill($request->validated());

        if (! $request->user()->ehModerador()) {
            $noticia->forceFill(['status' => StatusPublicacao::EmRevisao, 'motivo_rejeicao' => null]);
        }

        $noticia->save();

        return new NoticiaResource($noticia);
    }

    public function destroy(Noticia $noticia)
    {
        Gate::authorize('delete', $noticia);

        $noticia->delete();

        return response()->noContent();
    }

    public function moderar(ModeracaoRequest $request, Noticia $noticia, ModeracaoService $moderacao)
    {
        Gate::authorize('moderar', $noticia);

        $request->input('decisao') === 'aprovar'
            ? $moderacao->aprovar($noticia, $request->user())
            : $moderacao->rejeitar($noticia, $request->user(), $request->input('motivo'));

        return new NoticiaResource($noticia->refresh());
    }
}
