<?php

namespace App\Http\Controllers;

use App\Http\Requests\VagaRequest;
use App\Http\Resources\VagaResource;
use App\Models\Vaga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class VagaController extends Controller
{
    /**
     * Listagem pública das vagas publicadas.
     */
    public function index(Request $request)
    {
        $vagas = Vaga::with('usuario')
            ->orderByDesc('data_publicacao')
            ->paginate($this->porPagina($request));

        return VagaResource::collection($vagas);
    }

    /**
     * Vagas do usuário autenticado — usado pelo painel do empregador.
     * O filtro é feito no servidor: o navegador nunca recebe as
     * vagas de outras empresas para depois descartá-las.
     */
    public function minhas(Request $request)
    {
        $vagas = $request->user()->vagas()
            ->withCount('candidaturas')
            ->orderByDesc('data_publicacao')
            ->paginate($this->porPagina($request));

        return VagaResource::collection($vagas);
    }

    public function show(Vaga $vaga)
    {
        return new VagaResource($vaga->load('usuario'));
    }

    /**
     * O responsável é o usuário do token — nunca um id enviado pelo cliente.
     */
    public function store(VagaRequest $request)
    {
        $vaga = $request->user()->vagas()->create($request->validated());

        return (new VagaResource($vaga->refresh()))->response()->setStatusCode(201);
    }

    public function update(VagaRequest $request, Vaga $vaga)
    {
        Gate::authorize('update', $vaga);

        $vaga->update($request->validated());

        return new VagaResource($vaga);
    }

    public function destroy(Vaga $vaga)
    {
        Gate::authorize('delete', $vaga);

        $vaga->delete();

        return response()->noContent();
    }
}
