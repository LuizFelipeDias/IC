<?php

namespace App\Http\Controllers;

use App\Enums\MotivoDenuncia;
use App\Models\Denuncia;
use App\Models\Noticia;
use App\Models\Projeto;
use App\Services\ModeracaoService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DenunciaController extends Controller
{
    private const DENUNCIAVEIS = [
        'noticia' => Noticia::class,
        'projeto' => Projeto::class,
    ];

    /**
     * Qualquer usuário autenticado denuncia conteúdo publicado (ex.: peça perigosa).
     */
    public function store(Request $request)
    {
        $dados = $request->validate([
            'tipo' => ['required', Rule::in(array_keys(self::DENUNCIAVEIS))],
            'id' => ['required', 'integer'],
            'motivo' => ['required', Rule::enum(MotivoDenuncia::class)],
            'descricao' => ['nullable', 'string', 'max:2000'],
        ]);

        $conteudo = self::DENUNCIAVEIS[$dados['tipo']]::publicados()->findOrFail($dados['id']);

        $denuncia = Denuncia::firstOrNew([
            'id_denunciante' => $request->user()->id,
            'denunciavel_type' => $dados['tipo'],
            'denunciavel_id' => $conteudo->id,
        ]);
        $denuncia->fill(['motivo' => $dados['motivo'], 'descricao' => $dados['descricao'] ?? null])->save();

        return response()->json($denuncia->only(['id', 'status', 'motivo']), $denuncia->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Fila de denúncias abertas para a moderação.
     */
    public function index(Request $request)
    {
        return Denuncia::with(['denunciavel', 'denunciante:id,nome'])
            ->where('status', $request->input('status', 'aberta'))
            ->oldest()
            ->paginate($this->porPagina($request));
    }

    public function resolver(Request $request, Denuncia $denuncia, ModeracaoService $moderacao)
    {
        abort_unless($denuncia->status === 'aberta', 409, 'Esta denúncia já foi resolvida.');

        $dados = $request->validate([
            'procedente' => ['required', 'boolean'],
            'justificativa' => ['nullable', 'string', 'max:2000'],
        ]);

        $moderacao->resolverDenuncia($denuncia, $request->user(), $dados['procedente'], $dados['justificativa'] ?? null);

        return response()->json($denuncia->refresh()->only(['id', 'status', 'resolvida_em']));
    }
}
