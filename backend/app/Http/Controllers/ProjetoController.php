<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjetoRequest;
use App\Http\Resources\ProjetoResource;
use App\Models\Projeto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProjetoController extends Controller
{
    public function index(Request $request)
    {
        $projetos = Projeto::with('usuario')
            ->orderByDesc('data_publicacao')
            ->paginate($this->porPagina($request));

        return ProjetoResource::collection($projetos);
    }

    public function show(Projeto $projeto)
    {
        return new ProjetoResource($projeto->load('usuario'));
    }

    public function store(ProjetoRequest $request)
    {
        $projeto = $request->user()->projetos()->create($request->validated());

        return (new ProjetoResource($projeto->refresh()))->response()->setStatusCode(201);
    }

    public function update(ProjetoRequest $request, Projeto $projeto)
    {
        Gate::authorize('update', $projeto);

        $projeto->update($request->validated());

        return new ProjetoResource($projeto);
    }

    public function destroy(Projeto $projeto)
    {
        Gate::authorize('delete', $projeto);

        $projeto->delete();

        return response()->noContent();
    }
}
