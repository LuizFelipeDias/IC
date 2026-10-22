<?php

namespace App\Http\Controllers;

use App\Enums\StatusDoacao;
use App\Http\Requests\DoacaoRequest;
use App\Http\Resources\AnexoResource;
use App\Http\Resources\DoacaoResource;
use App\Models\Doacao;
use App\Services\Anexos\ArmazenamentoAnexos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

/**
 * Módulo 1 — Doação de makers: peças excedentes, carretéis usados e restos de filamento.
 */
class DoacaoController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'status' => ['nullable', Rule::enum(StatusDoacao::class)],
            'id_polimero' => ['nullable', 'integer'],
            'uf' => ['nullable', 'string', 'size:2'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $doacoes = Doacao::with(['polimero', 'doador', 'anexos'])
            ->where('status', $request->input('status', StatusDoacao::Disponivel->value))
            ->when($request->filled('id_polimero'), fn ($query) => $query->where('id_polimero', $request->integer('id_polimero')))
            ->when($request->filled('uf'), fn ($query) => $query->where('uf', mb_strtoupper($request->input('uf'))))
            ->when($request->filled('q'), fn ($query) => $query->where(fn ($q) => $q
                ->whereLike('titulo', '%'.$request->input('q').'%')
                ->orWhereLike('cidade', '%'.$request->input('q').'%')))
            ->latest()
            ->paginate($this->porPagina($request));

        return DoacaoResource::collection($doacoes);
    }

    public function minhas(Request $request)
    {
        $doacoes = $request->user()->hasMany(Doacao::class, 'id_doador')
            ->with(['polimero', 'anexos'])
            ->latest()
            ->paginate($this->porPagina($request));

        return DoacaoResource::collection($doacoes);
    }

    public function show(Doacao $doacao)
    {
        return new DoacaoResource($doacao->load(['polimero', 'doador', 'anexos']));
    }

    public function store(DoacaoRequest $request)
    {
        $doacao = new Doacao($request->validated());
        $doacao->id_doador = $request->user()->id;
        $doacao->save();

        return (new DoacaoResource($doacao->refresh()->load(['polimero', 'anexos'])))->response()->setStatusCode(201);
    }

    public function update(DoacaoRequest $request, Doacao $doacao)
    {
        Gate::authorize('update', $doacao);

        $doacao->update($request->validated());

        return new DoacaoResource($doacao->load(['polimero', 'anexos']));
    }

    public function destroy(Doacao $doacao, ArmazenamentoAnexos $armazenamento)
    {
        Gate::authorize('delete', $doacao);

        $doacao->anexos->each(fn ($anexo) => $armazenamento->remover($anexo));
        $doacao->delete();

        return response()->noContent();
    }

    /**
     * Até 5 fotos por doação (reencodadas em WebP, sem EXIF).
     */
    public function enviarFoto(Request $request, Doacao $doacao, ArmazenamentoAnexos $armazenamento)
    {
        Gate::authorize('update', $doacao);

        $request->validate([
            'arquivo' => ['required', File::image()->max(5 * 1024)->dimensions(Rule::dimensions()->maxWidth(6000)->maxHeight(6000))],
        ]);

        abort_if($doacao->anexos()->count() >= 5, 422, 'Cada doação aceita no máximo 5 fotos.');

        $anexo = $armazenamento->guardar($request->file('arquivo'), 'imagem', $doacao, $request->user());

        return (new AnexoResource($anexo))->response()->setStatusCode(201);
    }
}
