<?php

namespace App\Http\Controllers;

use App\Http\Requests\LaudoRequest;
use App\Http\Requests\LoteRequest;
use App\Http\Resources\LoteResource;
use App\Models\LaudoQualidade;
use App\Models\LoteFilamento;
use App\Services\Anexos\ArmazenamentoAnexos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * Lotes de filamento reciclado (rastreabilidade) e laudos de qualidade.
 */
class LoteController extends Controller
{
    private const RELACOES = ['polimero', 'coletas.doacao', 'eventos', 'laudos'];

    /** Transições permitidas pelo laboratório; aprovado/reprovado vêm do laudo. */
    private const TRANSICOES = [
        'em_processamento' => ['aguardando_laudo'],
        'aprovado' => ['distribuido'],
    ];

    public function index(Request $request)
    {
        $lotes = LoteFilamento::with('polimero')
            ->where('id_laboratorio', $request->user()->id)
            ->latest()
            ->paginate($this->porPagina($request));

        return LoteResource::collection($lotes);
    }

    public function show(LoteFilamento $lote)
    {
        Gate::authorize('view', $lote);

        return new LoteResource($lote->load(self::RELACOES));
    }

    /**
     * Forma o lote a partir de coletas concluídas; o peso de entrada é a soma das origens.
     */
    public function store(LoteRequest $request)
    {
        $lote = DB::transaction(function () use ($request) {
            $coletas = collect($request->input('coletas'));

            $lote = new LoteFilamento([
                'id_polimero' => $request->integer('id_polimero'),
                'diametro_nominal_mm' => $request->input('diametro_nominal_mm'),
                'cor' => $request->input('cor'),
                'peso_entrada_g' => $coletas->sum('peso_g'),
            ]);
            $lote->id_laboratorio = $request->user()->id;
            $lote->save();

            $lote->coletas()->attach($coletas->mapWithKeys(fn ($item) => [$item['id'] => ['peso_g' => $item['peso_g']]]));

            $lote->eventos()->create([
                'tipo' => 'coletado',
                'descricao' => "Lote formado a partir de {$coletas->count()} coleta(s).",
                'id_responsavel' => $request->user()->id,
                'ocorrido_em' => now(),
            ]);

            return $lote;
        });

        return (new LoteResource($lote->refresh()->load(self::RELACOES)))->response()->setStatusCode(201);
    }

    public function update(Request $request, LoteFilamento $lote)
    {
        Gate::authorize('update', $lote);

        $dados = $request->validate([
            'peso_saida_g' => ['sometimes', 'integer', 'min:1', 'lte:'.$lote->peso_entrada_g],
            'cor' => ['sometimes', 'nullable', 'string', 'max:30'],
            'produzido_em' => ['sometimes', 'date', 'before_or_equal:now'],
            'status' => ['sometimes', Rule::in(self::TRANSICOES[$lote->status] ?? [])],
        ], ['status.in' => 'Esta mudança de status não é permitida para o lote.']);

        $lote->forceFill($dados)->save();

        return new LoteResource($lote->load(self::RELACOES));
    }

    public function registrarEvento(Request $request, LoteFilamento $lote)
    {
        Gate::authorize('update', $lote);

        // "coletado" e "laudo_emitido" são registrados automaticamente.
        $dados = $request->validate([
            'tipo' => ['required', Rule::in(['triturado', 'extrudado', 'enviado', 'utilizado'])],
            'descricao' => ['nullable', 'string', 'max:255'],
            'ocorrido_em' => ['nullable', 'date', 'before_or_equal:now'],
        ]);

        $evento = $lote->eventos()->create([
            ...$dados,
            'ocorrido_em' => $dados['ocorrido_em'] ?? now(),
            'id_responsavel' => $request->user()->id,
        ]);

        return response()->json($evento->only(['id', 'tipo', 'descricao', 'ocorrido_em']), 201);
    }

    /**
     * Laudo com PDF obrigatório. O resultado define se o lote é liberado para uso.
     */
    public function emitirLaudo(LaudoRequest $request, LoteFilamento $lote, ArmazenamentoAnexos $armazenamento)
    {
        Gate::authorize('update', $lote);
        abort_if($lote->status === 'distribuido', 409, 'O lote já foi distribuído.');

        $laudo = DB::transaction(function () use ($request, $lote, $armazenamento) {
            $laudo = new LaudoQualidade($request->safe()->except('arquivo'));
            $laudo->id_lote = $lote->id;
            $laudo->id_laboratorio = $request->user()->id;
            $laudo->id_responsavel = $request->user()->id;
            $laudo->emitido_em = now();
            $laudo->save();

            $anexo = $armazenamento->guardar($request->file('arquivo'), 'laudo', $laudo, $request->user());
            $laudo->forceFill(['id_anexo' => $anexo->id])->save();

            $lote->forceFill(['status' => $laudo->resultado === 'reprovado' ? 'reprovado' : 'aprovado'])->save();
            $lote->eventos()->create([
                'tipo' => 'laudo_emitido',
                'descricao' => 'Laudo de qualidade: '.str_replace('_', ' ', $laudo->resultado).'.',
                'id_responsavel' => $request->user()->id,
                'ocorrido_em' => now(),
            ]);

            return $laudo;
        });

        return response()->json([
            'id' => $laudo->id,
            'resultado' => $laudo->resultado,
            'id_anexo' => $laudo->id_anexo,
            'status_lote' => $lote->status,
        ], 201);
    }
}
