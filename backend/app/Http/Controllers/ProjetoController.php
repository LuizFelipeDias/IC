<?php

namespace App\Http\Controllers;

use App\Http\Requests\Projeto;
use App\Http\Requests\ProjetoRequest;

class ProjetoController extends Controller
{
    public function index()
    {
        return Projeto::all();
    }

    public function store(ProjetoRequest $request)
    {
        return Projeto::create($request->validated());
    }

    public function show(Projeto $projeto)
    {
        return $projeto;
    }

    public function update(ProjetoRequest $request, Projeto $projeto)
    {
        $projeto->update($request->validated());

        return $projeto;
    }

    public function destroy(Projeto $projeto)
    {
        $projeto->delete();

        return response()->json();
    }
}
