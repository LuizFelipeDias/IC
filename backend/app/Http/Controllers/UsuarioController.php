<?php

namespace App\Http\Controllers;

use App\Http\Requests\UsuarioRequest;
use App\Http\Resources\UsuarioPrivadoResource;
use App\Http\Resources\UsuarioResource;
use App\Models\Usuario;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    /**
     * Cadastro público. Já devolve o token para o front fazer auto-login.
     */
    public function store(UsuarioRequest $request)
    {
        $usuario = new Usuario($request->safe()->except('senha_atual'));
        // Instituições aguardam a conferência do CNPJ/INEP por um moderador.
        $usuario->verificacao_status = $usuario->tipo_usuario->ehPessoaJuridica() ? 'pendente' : null;
        $usuario->save();
        $usuario->refresh();

        return response()->json([
            'message' => 'Cadastro realizado com sucesso.',
            'usuario' => new UsuarioPrivadoResource($usuario),
            'token' => $usuario->createToken('Token de acesso')->plainTextToken,
        ], 201);
    }

    /**
     * Perfil público de outro usuário (sem documentos nem contato).
     */
    public function show(Usuario $usuario)
    {
        return new UsuarioResource($usuario);
    }

    public function me(Request $request)
    {
        return new UsuarioPrivadoResource($request->user());
    }

    public function update(UsuarioRequest $request)
    {
        $usuario = $request->user();
        $usuario->fill($request->safe()->except('senha_atual'));

        // Trocar o documento de uma instituição exige nova conferência.
        if ($usuario->tipo_usuario->ehPessoaJuridica() && $usuario->isDirty(['cnpj', 'codigo_inep'])) {
            $usuario->forceFill(['verificacao_status' => 'pendente', 'verificado_em' => null]);
        }

        $usuario->save();

        return new UsuarioPrivadoResource($usuario);
    }

    public function destroy(Request $request)
    {
        $usuario = $request->user();
        $usuario->tokens()->delete();
        $usuario->delete();

        return response()->noContent();
    }
}
