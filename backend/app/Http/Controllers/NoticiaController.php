<?php

namespace App\Http\Controllers;

use App\Http\Requests\NoticiaRequest;
use App\Http\Resources\NoticiaResource;
use App\Models\Noticia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class NoticiaController extends Controller
{
    public function index(Request $request)
    {
        $noticias = Noticia::with('usuario')
            ->orderByDesc('data_publicacao')
            ->paginate($this->porPagina($request));

        return NoticiaResource::collection($noticias);
    }

    public function show(Noticia $noticia)
    {
        return new NoticiaResource($noticia->load('usuario'));
    }

    public function store(NoticiaRequest $request)
    {
        $noticia = $request->user()->noticias()->create($request->validated());

        return (new NoticiaResource($noticia->refresh()))->response()->setStatusCode(201);
    }

    public function update(NoticiaRequest $request, Noticia $noticia)
    {
        Gate::authorize('update', $noticia);

        $noticia->update($request->validated());

        return new NoticiaResource($noticia);
    }

    public function destroy(Noticia $noticia)
    {
        Gate::authorize('delete', $noticia);

        $noticia->delete();

        return response()->noContent();
    }
}
