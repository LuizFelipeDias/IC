<?php

namespace App\Http\Controllers;

use App\Enums\StatusChamado;
use App\Enums\StatusPublicacao;
use App\Enums\TipoUsuario;
use App\Http\Resources\InstituicaoResource;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Diretório de empresas, escolas, laboratórios e estabelecimentos verificados.
 * Só mostra dados públicos e números de participação na rede.
 */
class InstituicaoController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'tipo' => ['nullable', Rule::enum(TipoUsuario::class)->except([TipoUsuario::PessoaFisica])],
            'q' => ['nullable', 'string', 'max:100'],
            'ordem' => ['nullable', Rule::in(['nome', 'pontos', 'recentes'])],
        ]);

        $instituicoes = $this->consulta()
            ->when($request->filled('tipo'), fn (Builder $query) => $query->where('tipo_usuario', $request->input('tipo')))
            ->when($request->filled('q'), fn (Builder $query) => $query->whereLike('nome', '%'.$request->input('q').'%'))
            ->when(
                $request->input('ordem', 'nome'),
                fn (Builder $query, string $ordem) => match ($ordem) {
                    'pontos' => $query->orderByDesc('pontos_total'),
                    'recentes' => $query->orderByDesc('verificado_em'),
                    default => $query->orderBy('nome'),
                },
            )
            ->orderBy('id')
            ->paginate($this->porPagina($request, 24));

        return InstituicaoResource::collection($instituicoes);
    }

    public function show(int $instituicao)
    {
        return new InstituicaoResource($this->consulta()->findOrFail($instituicao));
    }

    private function consulta(): Builder
    {
        return Usuario::query()
            ->where('tipo_usuario', '!=', TipoUsuario::PessoaFisica->value)
            ->where('verificacao_status', 'verificado')
            ->withCount([
                'vagas',
                'projetos as projetos_publicados_count' => fn (Builder $query) => $query->where('status', StatusPublicacao::Publicado->value),
                'chamados as chamados_abertos_count' => fn (Builder $query) => $query->where('status', StatusChamado::Aberto->value),
                'chamadosAtendidos as chamados_resolvidos_count' => fn (Builder $query) => $query->where('status', StatusChamado::Resolvido->value),
                'lotes',
            ]);
    }
}
