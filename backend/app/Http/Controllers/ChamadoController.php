<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChamadoRequest;
use App\Models\Chamado;

class ChamadoController extends Controller
{
    public function index()
    {
        return Chamado::all();
    }

    public function store(ChamadoRequest $request)
    {
        return Chamado::create($request->validated());
    }

    public function show(Chamado $chamado)
    {
        return $chamado;
    }

    public function update(ChamadoRequest $request, Chamado $chamado)
    {
        $chamado->update($request->validated());

        return $chamado;
    }

    public function destroy(Chamado $chamado)
    {
        $chamado->delete();

        return response()->json();
    }
}
