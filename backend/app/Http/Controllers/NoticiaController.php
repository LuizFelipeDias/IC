<?php

namespace App\Http\Controllers;

use App\Http\Requests\NoticiaRequest;
use App\Models\Noticia;

class NoticiaController extends Controller
{
    public function index()
    {
        return Noticia::all();
    }

    public function store(NoticiaRequest $request)
    {
        return Noticia::create($request->validated());
    }

    public function show(Noticia $noticia)
    {
        return $noticia;
    }

    public function update(NoticiaRequest $request, Noticia $noticia)
    {
        $noticia->update($request->validated());

        return $noticia;
    }

    public function destroy(Noticia $noticia)
    {
        $noticia->delete();

        return response()->json();
    }
}
