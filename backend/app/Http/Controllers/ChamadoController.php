<?php

namespace App\Http\Controllers;

use App\Enums\AcaoPontuavel;
use App\Enums\LocalAtendimento;
use App\Enums\StatusChamado;
use App\Enums\TipoServico;
use App\Http\Requests\ChamadoRequest;
use App\Http\Resources\ChamadoResource;
use App\Models\Chamado;
use App\Services\GamificacaoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class ChamadoController extends Controller
{
    /**
     * Solicitante vê os próprios; prestador vê os abertos e os que atende.
     */
    public function index(Request $request)
    {
        $request->validate(['status' => ['nullable', Rule::enum(StatusChamado::class)]]);

        $chamados = Chamado::with(['usuario', 'prestador'])
            ->visiveisPara($request->user())
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->input('status')))
            ->latest('data_criacao')
            ->paginate($this->porPagina($request));

        return ChamadoResource::collection($chamados);
    }

    /**
     * Opções exibidas nos formulários (tipos de serviço e locais de atendimento).
     */
    public function opcoes()
    {
        $opcoes = fn (array $casos) => collect($casos)->map(fn ($caso) => ['valor' => $caso->value, 'rotulo' => $caso->rotulo()]);

        return response()->json([
            'tipos_servico' => $opcoes(TipoServico::cases()),
            'locais_atendimento' => $opcoes(LocalAtendimento::cases()),
        ]);
    }

    public function show(Chamado $chamado)
    {
        Gate::authorize('view', $chamado);

        return new ChamadoResource($chamado->load(['usuario', 'prestador']));
    }

    public function store(ChamadoRequest $request)
    {
        $chamado = $request->user()->chamados()->create($request->validated());

        return (new ChamadoResource($chamado->refresh()))->response()->setStatusCode(201);
    }

    public function update(ChamadoRequest $request, Chamado $chamado)
    {
        Gate::authorize('update', $chamado);

        $chamado->update($request->validated());

        return new ChamadoResource($chamado);
    }

    public function destroy(Chamado $chamado)
    {
        Gate::authorize('delete', $chamado);

        $chamado->delete();

        return response()->noContent();
    }

    /**
     * O prestador escolhe onde vai atender e assume o chamado.
     * O lock evita que dois prestadores aceitem o mesmo chamado ao mesmo tempo.
     */
    public function aceitar(Request $request, Chamado $chamado)
    {
        Gate::authorize('aceitar', $chamado);

        $dados = $request->validate([
            'local_atendimento' => ['required', Rule::enum(LocalAtendimento::class)],
        ]);

        $chamado = DB::transaction(function () use ($chamado, $dados, $request) {
            $atual = Chamado::lockForUpdate()->findOrFail($chamado->id);

            abort_unless($atual->status === StatusChamado::Aberto, 409, 'Este chamado já foi aceito por outro prestador.');

            $atual->forceFill([
                'status' => StatusChamado::EmAtendimento,
                'id_prestador' => $request->user()->id,
                'local_atendimento' => $dados['local_atendimento'],
                'aceito_em' => now(),
            ])->save();

            return $atual;
        });

        return new ChamadoResource($chamado->load(['usuario', 'prestador']));
    }

    public function concluir(Chamado $chamado, GamificacaoService $gamificacao)
    {
        Gate::authorize('concluir', $chamado);

        $chamado->forceFill([
            'status' => StatusChamado::Resolvido,
            'concluido_em' => now(),
        ])->save();

        $gamificacao->conceder($chamado->prestador, AcaoPontuavel::ChamadoConcluido, $chamado);

        return new ChamadoResource($chamado->load(['usuario', 'prestador']));
    }

    public function cancelar(Chamado $chamado)
    {
        Gate::authorize('cancelar', $chamado);

        $chamado->forceFill(['status' => StatusChamado::Cancelado])->save();

        return new ChamadoResource($chamado->load(['usuario', 'prestador']));
    }
}
