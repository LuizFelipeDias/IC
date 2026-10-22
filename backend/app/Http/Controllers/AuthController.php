<?php

namespace App\Http\Controllers;

use App\Http\Resources\UsuarioPrivadoResource;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credenciais = $request->validate([
            'email' => ['required', 'string', 'email'],
            'senha' => ['required', 'string'],
        ]);

        $usuario = Usuario::where('email', $credenciais['email'])->first();

        if (! $usuario || ! Hash::check($credenciais['senha'], $usuario->senha)) {
            return response()->json([
                'message' => 'E-mail e/ou senha incorretos.',
            ], 401);
        }

        return response()->json([
            'message' => 'Logado com sucesso.',
            'usuario' => new UsuarioPrivadoResource($usuario),
            'token' => $usuario->createToken('Token de acesso')->plainTextToken,
        ]);
    }

    /**
     * Revoga o token usado na requisição: sem isso o token continuaria
     * válido até expirar, mesmo depois de o usuário "sair".
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
