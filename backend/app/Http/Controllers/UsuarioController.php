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
        $usuario = Usuario::create($request->safe()->except('senha_atual'));

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
        $usuario->update($request->safe()->except('senha_atual'));

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
