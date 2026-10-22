<?php

namespace App\Http\Controllers;

use App\Http\Resources\CandidaturaResource;
use App\Models\Candidatura;
use App\Models\Vaga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class CandidaturaController extends Controller
{
    /**
     * Candidaturas do usuário autenticado.
     */
    public function index(Request $request)
    {
        $candidaturas = $request->user()->candidaturas()
            ->with('vaga.usuario')
            ->orderByDesc('data_candidatura')
            ->paginate($this->porPagina($request, 100));

        return CandidaturaResource::collection($candidaturas);
    }

    /**
     * Candidaturas recebidas por uma vaga — visível apenas para quem publicou.
     */
    public function porVaga(Request $request, Vaga $vaga)
    {
        Gate::authorize('verCandidaturas', $vaga);

        $candidaturas = $vaga->candidaturas()
            ->with('usuario')
            ->orderByDesc('data_candidatura')
            ->paginate($this->porPagina($request));

        return CandidaturaResource::collection($candidaturas);
    }

    public function store(Request $request)
    {
        $dados = $request->validate([
            'id_vaga' => ['required', 'integer', 'exists:vagas,id'],
        ]);

        $chave = ['id_usuario' => $request->user()->id, 'id_vaga' => $dados['id_vaga']];

        // Repetir o pedido não duplica: devolve a candidatura existente (200).
        if ($existente = Candidatura::where($chave)->first()) {
            return new CandidaturaResource($existente->load('vaga'));
        }

        abort_unless(
            Vaga::findOrFail($dados['id_vaga'])->estaAberta(),
            409,
            'Esta vaga está encerrada e não recebe novas candidaturas.',
        );

        // O candidato não escolhe o próprio status: o banco aplica 'Em análise'.
        // O índice UNIQUE(id_usuario, id_vaga) garante que não haja duplicata.
        $candidatura = Candidatura::firstOrCreate($chave);

        return (new CandidaturaResource($candidatura->refresh()))
            ->response()
            ->setStatusCode($candidatura->wasRecentlyCreated ? 201 : 200);
    }

    public function update(Request $request, Candidatura $candidatura)
    {
        Gate::authorize('update', $candidatura);

        $dados = $request->validate([
            'status' => ['required', Rule::in(Candidatura::STATUS)],
        ]);

        $candidatura->update($dados);

        return new CandidaturaResource($candidatura);
    }

    public function destroy(Candidatura $candidatura)
    {
        Gate::authorize('delete', $candidatura);

        $candidatura->delete();

        return response()->noContent();
    }
}
