<?php

namespace App\Http\Controllers;

use App\Models\Vaga;
use Illuminate\Http\Request;

class VagaController extends Controller
{
    /**
     * Listagem pública das vagas publicadas.
     */
    public function index()
    {
        return Vaga::orderByDesc('data_publicacao')->get();
    }

    /**
     * Vagas do usuário autenticado — usado pelo painel do empregador.
     * O filtro é feito aqui, no servidor: o navegador nunca recebe as
     * vagas de outras empresas para depois descartá-las.
     */
    public function minhas(Request $request)
    {
        return Vaga::where('id_usuario', $request->user()->id)
            ->orderByDesc('data_publicacao')
            ->get();
    }

    public function show(Vaga $vaga)
    {
        return $vaga;
    }

    /**
     * Publicação de vaga.
     *
     * Só o título e o texto são obrigatórios; o responsável é o usuário
     * do token — nunca um id enviado pelo cliente, que poderia ser forjado.
     */
    public function store(Request $request)
    {
        $dados = $request->validate([
            'titulo' => 'required|string|max:255',
            'texto'  => 'required|string',
            'tema'   => 'nullable|string|max:100',
            'cep'    => 'nullable|string|max:10',
            'cidade' => 'nullable|string|max:100',
        ]);

        $dados['id_usuario'] = $request->user()->id;

        return response()->json(Vaga::create($dados), 201);
    }

    public function update(Request $request, Vaga $vaga)
    {
        abort_unless($vaga->id_usuario === $request->user()->id, 403, 'Esta vaga não é sua.');

        $dados = $request->validate([
            'titulo' => 'sometimes|required|string|max:255',
            'texto'  => 'sometimes|required|string',
            'tema'   => 'nullable|string|max:100',
            'cep'    => 'nullable|string|max:10',
            'cidade' => 'nullable|string|max:100',
        ]);

        $vaga->update($dados);

        return $vaga;
    }

    /**
     * Exclusão restrita ao dono da vaga.
     */
    public function destroy(Request $request, Vaga $vaga)
    {
        abort_unless($vaga->id_usuario === $request->user()->id, 403, 'Esta vaga não é sua.');

        $vaga->delete();

        return response()->noContent();
    }
}
