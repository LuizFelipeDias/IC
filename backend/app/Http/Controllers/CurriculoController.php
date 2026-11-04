<?php

namespace App\Http\Controllers;

use App\Enums\Disponibilidade;
use App\Enums\ModalidadePreferida;
use App\Http\Requests\CurriculoRequest;
use App\Http\Resources\CurriculoResource;
use App\Models\Curriculo;
use App\Support\UnidadesFederativas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class CurriculoController extends Controller
{
    /**
     * Banco de currículos (rota restrita ao perfil contratante): apenas os
     * currículos marcados como visíveis, com filtros
     * ?q= (cargo, habilidades, especialidades), especialidade=, uf=, modalidade=, disponibilidade=.
     */
    public function index(Request $request)
    {
        if ($request->filled('uf')) {
            $request->merge(['uf' => UnidadesFederativas::normalizar($request->input('uf'))]);
        }

        $filtros = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'especialidade' => ['nullable', 'string', 'max:60'],
            'uf' => ['nullable', Rule::in(UnidadesFederativas::SIGLAS)],
            'modalidade' => ['nullable', Rule::enum(ModalidadePreferida::class)],
            'disponibilidade' => ['nullable', Rule::enum(Disponibilidade::class)],
        ]);

        $curriculos = Curriculo::with('usuario')
            ->visiveisNoBanco()
            ->filtrar($filtros)
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->paginate($this->porPagina($request));

        return CurriculoResource::collection($curriculos);
    }

    /**
     * Currículos do próprio usuário (visíveis ou não no banco).
     */
    public function meus(Request $request)
    {
        $curriculos = $request->user()->curriculos()
            ->with('usuario')
            ->orderByDesc('id')
            ->paginate($this->porPagina($request));

        return CurriculoResource::collection($curriculos);
    }

    public function show(Curriculo $curriculo)
    {
        Gate::authorize('view', $curriculo);

        return new CurriculoResource($curriculo->load('usuario'));
    }

    /**
     * Só pessoa física (perfil candidato) cadastra currículo; o dono é o usuário do token.
     */
    public function store(CurriculoRequest $request)
    {
        $curriculo = $request->user()->curriculos()->create($request->validated());

        return (new CurriculoResource($curriculo->refresh()))->response()->setStatusCode(201);
    }

    public function update(CurriculoRequest $request, Curriculo $curriculo)
    {
        Gate::authorize('update', $curriculo);

        $curriculo->update($request->validated());

        return new CurriculoResource($curriculo);
    }

    public function destroy(Curriculo $curriculo)
    {
        Gate::authorize('delete', $curriculo);

        $curriculo->delete();

        return response()->noContent();
    }
}
