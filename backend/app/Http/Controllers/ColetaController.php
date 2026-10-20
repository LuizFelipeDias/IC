<?php

namespace App\Http\Controllers;

use App\Enums\AcaoPontuavel;
use App\Enums\StatusColeta;
use App\Enums\StatusDoacao;
use App\Http\Resources\ColetaResource;
use App\Models\Doacao;
use App\Models\SolicitacaoColeta;
use App\Services\GamificacaoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * Módulo 2 — Receptores e reciclagem: solicitação e agendamento de coleta/entrega.
 */
class ColetaController extends Controller
{
    private const RELACOES = ['doacao.polimero', 'doacao.doador', 'doacao.anexos', 'laboratorio'];

    /**
     * Para o laboratório: as que ele pediu. Para o doador: as feitas sobre as doações dele.
     */
    public function index(Request $request)
    {
        $request->validate([
            'papel' => ['nullable', Rule::in(['laboratorio', 'doador'])],
            'status' => ['nullable', Rule::enum(StatusColeta::class)],
        ]);

        $usuario = $request->user();
        $papel = $request->input('papel');

        $coletas = SolicitacaoColeta::with(self::RELACOES)
            ->where(function ($query) use ($usuario, $papel) {
                if ($papel !== 'doador') {
                    $query->orWhere('id_laboratorio', $usuario->id);
                }
                if ($papel !== 'laboratorio') {
                    $query->orWhereHas('doacao', fn ($doacao) => $doacao->where('id_doador', $usuario->id));
                }
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->input('status')))
            ->latest()
            ->paginate($this->porPagina($request));

        return ColetaResource::collection($coletas);
    }

    public function show(SolicitacaoColeta $coleta)
    {
        Gate::authorize('view', $coleta);

        return new ColetaResource($coleta->load(self::RELACOES));
    }

    /**
     * Laboratório verificado solicita uma doação disponível. Uma solicitação ativa
     * por doação (também garantido por índice único parcial no PostgreSQL).
     */
    public function store(Request $request, Doacao $doacao)
    {
        $dados = $request->validate([
            'modalidade' => ['required', Rule::in(['coleta', 'entrega'])],
            'agendado_para' => ['nullable', 'date', 'after:now'],
            'observacoes' => ['nullable', 'string', 'max:2000'],
        ]);

        abort_if($doacao->id_doador === $request->user()->id, 422, 'Você não pode solicitar a própria doação.');
        abort_unless($doacao->status === StatusDoacao::Disponivel, 409, 'Esta doação não está mais disponível.');
        abort_if(
            $doacao->solicitacoesColeta()->whereIn('status', ['pendente', 'aceita', 'agendada'])->exists(),
            409,
            'Esta doação já tem uma solicitação em andamento.',
        );

        $coleta = new SolicitacaoColeta([...$dados, 'id_doacao' => $doacao->id]);
        $coleta->id_laboratorio = $request->user()->id;
        $coleta->save();

        return (new ColetaResource($coleta->refresh()->load(self::RELACOES)))->response()->setStatusCode(201);
    }

    /** O doador aceita; com data informada, a coleta já fica agendada. */
    public function aceitar(Request $request, SolicitacaoColeta $coleta)
    {
        Gate::authorize('aceitar', $coleta);

        $dados = $request->validate(['agendado_para' => ['nullable', 'date', 'after:now']]);
        $data = $dados['agendado_para'] ?? $coleta->agendado_para;

        DB::transaction(function () use ($coleta, $data) {
            $coleta->forceFill([
                'status' => $data ? StatusColeta::Agendada : StatusColeta::Aceita,
                'agendado_para' => $data,
            ])->save();
            $coleta->doacao->forceFill(['status' => StatusDoacao::Reservada])->save();
        });

        return new ColetaResource($coleta->load(self::RELACOES));
    }

    public function recusar(Request $request, SolicitacaoColeta $coleta)
    {
        Gate::authorize('recusar', $coleta);

        $dados = $request->validate(['motivo' => ['nullable', 'string', 'max:2000']]);

        $coleta->forceFill(['status' => StatusColeta::Recusada, 'observacoes' => $dados['motivo'] ?? $coleta->observacoes])->save();

        return new ColetaResource($coleta->load(self::RELACOES));
    }

    public function agendar(Request $request, SolicitacaoColeta $coleta)
    {
        Gate::authorize('agendar', $coleta);

        $dados = $request->validate(['agendado_para' => ['required', 'date', 'after:now']]);

        $coleta->forceFill(['status' => StatusColeta::Agendada, 'agendado_para' => $dados['agendado_para']])->save();

        return new ColetaResource($coleta->load(self::RELACOES));
    }

    /**
     * O laboratório registra o peso efetivamente recebido. Laboratório e doador pontuam.
     */
    public function concluir(Request $request, SolicitacaoColeta $coleta, GamificacaoService $gamificacao)
    {
        Gate::authorize('concluir', $coleta);

        $dados = $request->validate(['peso_recebido_g' => ['required', 'integer', 'min:1', 'max:1000000']]);

        DB::transaction(function () use ($coleta, $dados, $gamificacao) {
            $coleta->forceFill([
                'status' => StatusColeta::Concluida,
                'peso_recebido_g' => $dados['peso_recebido_g'],
                'concluida_em' => now(),
            ])->save();
            $coleta->doacao->forceFill(['status' => StatusDoacao::Coletada])->save();

            $gamificacao->conceder($coleta->laboratorio, AcaoPontuavel::ColetaConcluida, $coleta);
            $gamificacao->conceder($coleta->doacao->doador, AcaoPontuavel::DoacaoEntregue, $coleta);
        });

        return new ColetaResource($coleta->load(self::RELACOES));
    }

    /** Cancelamento por qualquer das partes devolve a doação ao mural. */
    public function cancelar(SolicitacaoColeta $coleta)
    {
        Gate::authorize('cancelar', $coleta);

        DB::transaction(function () use ($coleta) {
            $coleta->forceFill(['status' => StatusColeta::Cancelada])->save();

            if ($coleta->doacao->status === StatusDoacao::Reservada) {
                $coleta->doacao->forceFill(['status' => StatusDoacao::Disponivel])->save();
            }
        });

        return new ColetaResource($coleta->load(self::RELACOES));
    }
}
