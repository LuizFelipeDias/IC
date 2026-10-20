<?php

namespace App\Http\Controllers;

use App\Enums\Perfil;
use App\Http\Requests\CurriculoRequest;
use App\Http\Resources\CurriculoResource;
use App\Models\Curriculo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CurriculoController extends Controller
{
    /**
     * Instituições verificadas consultam o banco de currículos; os demais veem só os próprios.
     */
    public function index(Request $request)
    {
        $usuario = $request->user();

        $curriculos = Curriculo::with('usuario')
            ->when(! $usuario->temPerfil(Perfil::Contratante), fn ($query) => $query->where('id_usuario', $usuario->id))
            ->orderByDesc('id')
            ->paginate($this->porPagina($request));

        return CurriculoResource::collection($curriculos);
    }

    public function show(Curriculo $curriculo)
    {
        Gate::authorize('view', $curriculo);

        return new CurriculoResource($curriculo->load('usuario'));
    }

    public function store(CurriculoRequest $request)
    {
        $curriculo = $request->user()->curriculos()->create($request->validated());

        return (new CurriculoResource($curriculo))->response()->setStatusCode(201);
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
