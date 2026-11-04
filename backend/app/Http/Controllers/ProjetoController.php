<?php

namespace App\Http\Controllers;

use App\Enums\AreaProjeto;
use App\Enums\LicencaProjeto;
use App\Enums\StatusPublicacao;
use App\Http\Requests\ModeracaoRequest;
use App\Http\Requests\ProjetoRequest;
use App\Http\Resources\AnexoResource;
use App\Http\Resources\ProjetoResource;
use App\Models\Projeto;
use App\Rules\ModeloImpressao3d;
use App\Services\Anexos\ArmazenamentoAnexos;
use App\Services\ModeracaoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class ProjetoController extends Controller
{
    /**
     * Catálogo público: só projetos aprovados, com filtros por área e licença. Moderadores podem filtrar por ?status=.
     */
    public function index(Request $request)
    {
        $request->validate([
            'status' => ['nullable', Rule::enum(StatusPublicacao::class)],
            'area' => ['nullable', Rule::enum(AreaProjeto::class)],
            'licenca' => ['nullable', Rule::enum(LicencaProjeto::class)],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $moderador = (bool) $request->user('sanctum')?->ehModerador();

        $projetos = Projeto::with(['usuario', 'anexos'])
            ->when(
                $moderador && $request->filled('status'),
                fn ($query) => $query->where('status', $request->input('status')),
                fn ($query) => $query->publicados(),
            )
            ->when($request->filled('area'), fn ($query) => $query->where('area', $request->input('area')))
            ->when($request->filled('licenca'), fn ($query) => $query->where('licenca', $request->input('licenca')))
            ->when($request->filled('q'), fn ($query) => $query->whereLike('titulo', '%'.$request->input('q').'%'))
            ->orderByDesc('data_publicacao')
            ->paginate($this->porPagina($request));

        return ProjetoResource::collection($projetos);
    }

    /**
     * Projetos do autor em qualquer status (acompanhamento da revisão).
     */
    public function minhas(Request $request)
    {
        $projetos = $request->user()->projetos()
            ->latest()
            ->paginate($this->porPagina($request));

        return ProjetoResource::collection($projetos);
    }

    public function show(Request $request, Projeto $projeto)
    {
        Gate::forUser($request->user('sanctum'))->authorize('view', $projeto);

        return new ProjetoResource($projeto->load(['usuario', 'anexos']));
    }

    /**
     * Projeto de moderador já nasce publicado; as demais aguardam revisão.
     */
    public function store(ProjetoRequest $request, ModeracaoService $moderacao)
    {
        $usuario = $request->user();
        $projeto = $usuario->projetos()->create($request->validated());

        if ($usuario->ehModerador()) {
            $moderacao->aprovar($projeto, $usuario);
        }

        return (new ProjetoResource($projeto->refresh()))->response()->setStatusCode(201);
    }

    /**
     * Edição do autor volta para revisão, para não alterar texto já aprovado sem curadoria.
     */
    public function update(ProjetoRequest $request, Projeto $projeto)
    {
        Gate::authorize('update', $projeto);

        $projeto->fill($request->validated());

        if (! $request->user()->ehModerador()) {
            $projeto->forceFill(['status' => StatusPublicacao::EmRevisao, 'motivo_rejeicao' => null]);
        }

        $projeto->save();

        return new ProjetoResource($projeto);
    }

    public function destroy(Projeto $projeto)
    {
        Gate::authorize('delete', $projeto);

        $projeto->delete();

        return response()->noContent();
    }

    public function moderar(ModeracaoRequest $request, Projeto $projeto, ModeracaoService $moderacao)
    {
        Gate::authorize('moderar', $projeto);

        $request->input('decisao') === 'aprovar'
            ? $moderacao->aprovar($projeto, $request->user())
            : $moderacao->rejeitar($projeto, $request->user(), $request->input('motivo'));

        return new ProjetoResource($projeto->refresh());
    }

    /**
     * Envio de modelo 3D (STL/3MF, até 50 MB) ou imagem (até 5 MB) do projeto.
     * Arquivo novo de quem não é moderador devolve o projeto para revisão.
     */
    public function enviarAnexo(Request $request, Projeto $projeto, ArmazenamentoAnexos $armazenamento)
    {
        Gate::authorize('update', $projeto);

        $request->validate(['tipo' => ['required', Rule::in(['modelo', 'imagem'])]]);
        $tipo = $request->input('tipo');

        $request->validate([
            'arquivo' => $tipo === 'modelo'
                ? ['required', new ModeloImpressao3d]
                : ['required', File::image()->max(5 * 1024)->dimensions(Rule::dimensions()->maxWidth(6000)->maxHeight(6000))],
        ]);

        $limite = $tipo === 'modelo' ? 5 : 8;
        abort_if(
            $projeto->anexos()->where('tipo_documento', $tipo)->count() >= $limite,
            422,
            "Cada projeto aceita no máximo {$limite} arquivos desse tipo.",
        );

        $anexo = $armazenamento->guardar($request->file('arquivo'), $tipo, $projeto, $request->user());

        if (! $request->user()->ehModerador()) {
            $projeto->forceFill(['status' => StatusPublicacao::EmRevisao])->save();
        }

        return (new AnexoResource($anexo))->response()->setStatusCode(201);
    }
}
