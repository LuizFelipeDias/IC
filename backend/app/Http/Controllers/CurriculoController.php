<?php

namespace App\Http\Controllers;

use App\Http\Requests\CurriculoRequest;
use App\Models\Curriculo;

class CurriculoController extends Controller
{
    public function index()
    {
        return Curriculo::all();
    }

    public function store(CurriculoRequest $request)
    {
        return Curriculo::create($request->validated());
    }

    public function show(Curriculo $curriculo)
    {
        return $curriculo;
    }

    public function update(CurriculoRequest $request, Curriculo $curriculo)
    {
        $curriculo->update($request->validated());

        return $curriculo;
    }

    public function destroy(Curriculo $curriculo)
    {
        $curriculo->delete();

        return response()->json();
    }
}
