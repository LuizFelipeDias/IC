<?php

namespace App\Http\Controllers;

use App\Enums\ModalidadeTrabalho;
use App\Enums\NivelVaga;
use App\Enums\StatusVaga;
use App\Enums\TipoContrato;
use App\Http\Requests\VagaRequest;
use App\Http\Resources\VagaResource;
use App\Models\Curriculo;
use App\Models\Vaga;
use App\Support\UnidadesFederativas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class VagaController extends Controller
{
    /**
     * Mural público: por padrão só as vagas abertas.
     * ?q=&tema=&modalidade=&tipo_contrato=&nivel=&uf=&cidade=&status=aberta|encerrada
     */
    public function index(Request $request)
    {
        $filtros = $this->filtros($request);

        $vagas = Vaga::with('usuario')
            ->when(($filtros['status'] ?? 'aberta') === StatusVaga::Encerrada->value, fn ($query) => $query->encerradas(), fn ($query) => $query->abertas())
            ->filtrar($filtros)
            ->orderByDesc('data_publicacao')
            ->orderByDesc('id')
            ->paginate($this->porPagina($request));

        return VagaResource::collection($vagas);
    }

    /**
     * Opções dos formulários e filtros (rótulos em português).
     */
    public function opcoes()
    {
        $opcoes = fn (array $casos) => collect($casos)->map(fn ($caso) => ['valor' => $caso->value, 'rotulo' => $caso->rotulo()]);

        return response()->json([
            'modalidades' => $opcoes(ModalidadeTrabalho::cases()),
            'tipos_contrato' => $opcoes(TipoContrato::cases()),
            'niveis' => $opcoes(NivelVaga::cases()),
            'ufs' => UnidadesFederativas::SIGLAS,
            'especialidades_sugeridas' => Curriculo::ESPECIALIDADES_SUGERIDAS,
        ]);
    }

    /**
     * Vagas do usuário autenticado (abertas e encerradas) — painel do contratante.
     * O filtro é feito no servidor: o navegador nunca recebe as
     * vagas de outras empresas para depois descartá-las.
     */
    public function minhas(Request $request)
    {
        $vagas = $request->user()->vagas()
            ->withCount('candidaturas')
            ->orderByDesc('data_publicacao')
            ->orderByDesc('id')
            ->paginate($this->porPagina($request));

        return VagaResource::collection($vagas);
    }

    public function show(Vaga $vaga)
    {
        return new VagaResource($vaga->load('usuario'));
    }

    /**
     * O responsável é o usuário do token — nunca um id enviado pelo cliente.
     */
    public function store(VagaRequest $request)
    {
        $vaga = $request->user()->vagas()->create($request->validated());

        return (new VagaResource($vaga->refresh()->load('usuario')))->response()->setStatusCode(201);
    }

    public function update(VagaRequest $request, Vaga $vaga)
    {
        Gate::authorize('update', $vaga);

        $vaga->update($request->validated());

        return new VagaResource($vaga);
    }

    /**
     * Encerra a vaga: ela sai do mural e deixa de aceitar candidaturas.
     * As candidaturas recebidas continuam visíveis para quem publicou.
     */
    public function encerrar(Vaga $vaga)
    {
        Gate::authorize('encerrar', $vaga);

        if ($vaga->status !== StatusVaga::Encerrada) {
            $vaga->forceFill(['status' => StatusVaga::Encerrada, 'encerrada_em' => now()])->save();
        }

        return new VagaResource($vaga->loadCount('candidaturas'));
    }

    public function destroy(Vaga $vaga)
    {
        Gate::authorize('delete', $vaga);

        $vaga->delete();

        return response()->noContent();
    }

    /**
     * Valida os filtros da listagem. Listas separadas por vírgula viram arrays.
     *
     * @return array<string, mixed>
     */
    private function filtros(Request $request): array
    {
        $lista = fn (string $campo) => $request->filled($campo)
            ? array_values(array_filter(array_map('trim', explode(',', (string) $request->input($campo)))))
            : null;

        $request->merge([
            'tema' => $lista('tema'),
            'modalidade' => $lista('modalidade'),
            'tipo_contrato' => $lista('tipo_contrato'),
            'nivel' => $lista('nivel'),
            'uf' => $request->filled('uf') ? UnidadesFederativas::normalizar($request->input('uf')) : null,
        ]);

        return $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'tema' => ['nullable', 'array'],
            'tema.*' => ['string', 'max:100'],
            'modalidade' => ['nullable', 'array'],
            'modalidade.*' => [Rule::enum(ModalidadeTrabalho::class)],
            'tipo_contrato' => ['nullable', 'array'],
            'tipo_contrato.*' => [Rule::enum(TipoContrato::class)],
            'nivel' => ['nullable', 'array'],
            'nivel.*' => [Rule::enum(NivelVaga::class)],
            'uf' => ['nullable', Rule::in(UnidadesFederativas::SIGLAS)],
            'cidade' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::enum(StatusVaga::class)],
        ]);
    }
}
