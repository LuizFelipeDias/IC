<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChamadoRequest;
use App\Http\Resources\ChamadoResource;
use App\Models\Chamado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ChamadoController extends Controller
{
    public function index(Request $request)
    {
        $chamados = Chamado::with('usuario')
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest('data_criacao')
            ->paginate($this->porPagina($request));

        return ChamadoResource::collection($chamados);
    }

    public function show(Chamado $chamado)
    {
        return new ChamadoResource($chamado->load('usuario'));
    }

    public function store(ChamadoRequest $request)
    {
        $chamado = $request->user()->chamados()->create($request->validated());

        return (new ChamadoResource($chamado->refresh()))->response()->setStatusCode(201);
    }

    public function update(ChamadoRequest $request, Chamado $chamado)
    {
        Gate::authorize('update', $chamado);

        $chamado->update($request->validated());

        return new ChamadoResource($chamado);
    }

    public function destroy(Chamado $chamado)
    {
        Gate::authorize('delete', $chamado);

        $chamado->delete();

        return response()->noContent();
    }
}
