<?php

namespace App\Http\Controllers;

use App\Models\Candidatura;
use App\Models\Vaga;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CandidaturaController extends Controller
{
    /** Valores aceitos na coluna status (varchar(50), default 'Em análise'). */
    private const STATUS = ['Em análise', 'Aprovada', 'Reprovada', 'Cancelada'];

    /**
     * Candidaturas do usuário autenticado.
     * Sem este escopo, qualquer usuário logado veria as candidaturas
     * de todos os demais — inclusive em quais vagas se inscreveram.
     */
    public function index(Request $request)
    {
        return Candidatura::with('vaga:id,titulo,tema,cidade')
            ->where('id_usuario', $request->user()->id)
            ->orderByDesc('data_candidatura')
            ->get();
    }

    /**
     * Candidaturas recebidas por uma vaga — visível apenas para quem publicou.
     */
    public function porVaga(Request $request, Vaga $vaga)
    {
        abort_unless($vaga->id_usuario === $request->user()->id, 403, 'Esta vaga não é sua.');

        return Candidatura::with('usuario:id,nome,email')
            ->where('id_vaga', $vaga->id)
            ->orderByDesc('data_candidatura')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_vaga' => 'required|exists:vagas,id',
        ]);

        $chave = [
            'id_usuario' => $request->user()->id,
            'id_vaga'    => $request->integer('id_vaga'),
        ];

        // O candidato não escolhe o próprio status: o banco aplica 'Em análise'.
        // firstOrCreate evita duplicata mesmo sem UNIQUE na tabela.
        $candidatura = Candidatura::firstOrCreate($chave);

        return response()->json($candidatura, $candidatura->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Mudança de status — quem decide é o dono da vaga, não o candidato.
     */
    public function update(Request $request, Candidatura $candidatura)
    {
        $vaga = Vaga::findOrFail($candidatura->id_vaga);
        abort_unless($vaga->id_usuario === $request->user()->id, 403, 'Esta vaga não é sua.');

        $dados = $request->validate([
            'status' => ['required', Rule::in(self::STATUS)],
        ]);

        $candidatura->update($dados);

        return $candidatura;
    }

    /**
     * O candidato desiste da própria candidatura.
     */
    public function destroy(Request $request, Candidatura $candidatura)
    {
        abort_unless($candidatura->id_usuario === $request->user()->id, 403);

        $candidatura->delete();

        return response()->noContent();
    }
}
