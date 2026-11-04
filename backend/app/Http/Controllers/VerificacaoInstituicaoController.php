<?php

namespace App\Http\Controllers;

use App\Contracts\ConsultaCnpj;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Fila de conferência de empresas, escolas e laboratórios (moderadores).
 */
class VerificacaoInstituicaoController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['status' => ['nullable', Rule::in(['pendente', 'verificado', 'rejeitado'])]]);

        $instituicoes = Usuario::query()
            ->where('empresa', true)
            ->where('verificacao_status', $request->input('status', 'pendente'))
            ->oldest()
            ->paginate($this->porPagina($request));

        return response()->json($instituicoes->through(fn (Usuario $usuario) => [
            'id' => $usuario->id,
            'nome' => $usuario->nome,
            'email' => $usuario->email,
            'telefone' => $usuario->telefone,
            'tipo_usuario' => $usuario->tipo_usuario->value,
            'tipo_rotulo' => $usuario->tipo_usuario->rotulo(),
            'cnpj' => $usuario->cnpj,
            'codigo_inep' => $usuario->codigo_inep,
            'verificacao_status' => $usuario->verificacao_status,
            'motivo_verificacao' => $usuario->motivo_verificacao,
            'created_at' => $usuario->created_at,
        ]));
    }

    /**
     * Situação cadastral na Receita Federal, para apoiar a decisão do moderador.
     */
    public function consultarCnpj(Usuario $usuario, ConsultaCnpj $consulta)
    {
        abort_unless($usuario->tipo_usuario->ehPessoaJuridica() && $usuario->cnpj, 404);

        $dados = $consulta->consultar($usuario->cnpj);

        abort_if($dados === null, 502, 'Não foi possível consultar o CNPJ agora. Tente novamente mais tarde.');

        return response()->json($dados);
    }

    public function decidir(Request $request, Usuario $usuario)
    {
        abort_unless($usuario->tipo_usuario->ehPessoaJuridica(), 422, 'Somente instituições passam por verificação.');
        abort_if($usuario->id === $request->user()->id, 403, 'Você não pode verificar o próprio cadastro.');

        $dados = $request->validate([
            'decisao' => ['required', 'in:aprovar,rejeitar'],
            'motivo' => ['required_if:decisao,rejeitar', 'nullable', 'string', 'max:2000'],
        ]);

        $aprovado = $dados['decisao'] === 'aprovar';

        $usuario->forceFill([
            'verificacao_status' => $aprovado ? 'verificado' : 'rejeitado',
            'verificado_em' => $aprovado ? now() : null,
            'id_verificador' => $request->user()->id,
            'motivo_verificacao' => $dados['motivo'] ?? null,
        ])->save();

        return response()->json([
            'id' => $usuario->id,
            'verificacao_status' => $usuario->verificacao_status,
            'perfis' => $usuario->perfis(),
        ]);
    }
}
