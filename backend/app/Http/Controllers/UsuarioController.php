<?php

namespace App\Http\Controllers;

use App\Http\Requests\UsuarioRequest;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function login(Request $request)
    {
        // 1. Guardamos os dados validados em uma variável
        $credenciais = $request->validate([
            'email' => 'required',
            'senha' => 'required',
        ]);

        // 2. Buscamos usando o array de credenciais validadas
        $usuario = Usuario::where('email', $credenciais['email'])->first();

        // 3. Comparamos a senha usando o array, evitando o "magic method" do $request
        if(!$usuario || !Hash::check($credenciais['senha'], $usuario->senha)){
            return response()->json([
                'Mensagem' => "Email e/ou senha incorretos.",
            ], 401);
        }

        $token = $usuario->createToken('Token de acesso')->plainTextToken;

        return response()->json([
            'Mensagem' => 'Logado com sucesso.',
            'usuario' => $usuario,
            'token' => $token
        ]);
    }

    public function index()
    {
        return Usuario::all();
    }

    public function store(UsuarioRequest $request)
    {
        return Usuario::create($request->validated());
    }

    public function show(Usuario $usuario)
    {
        return $usuario;
    }

    public function update(UsuarioRequest $request, Usuario $usuario)
    {
        $usuario->update($request->validated());

        return $usuario;
    }

    public function destroy(Usuario $usuario)
    {
        $usuario->delete();

        return response()->json();
    }
}
