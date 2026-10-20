<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Cadastro (POST /usuario) e edição dos próprios dados (PATCH /usuario/me).
 */
class UsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $cadastro = $this->isMethod('post');
        $obrigatorio = $cadastro ? 'required' : 'sometimes';
        $idAtual = $this->user()?->id;

        return [
            'nome' => [$obrigatorio, 'string', 'max:255'],
            'email' => [$obrigatorio, 'string', 'email:rfc', 'max:255', Rule::unique('usuario', 'email')->ignore($idAtual)],
            'telefone' => [$obrigatorio, 'string', 'max:20'],
            'senha' => [$obrigatorio, 'string', Password::min(8)->mixedCase()->numbers()->symbols()],
            // Trocar a senha exige confirmar a atual.
            'senha_atual' => [Rule::requiredIf(! $cadastro && $this->filled('senha')), 'nullable', 'current_password:sanctum'],
            // O perfil é escolhido no cadastro; mudá-lo depois liberaria o banco de currículos.
            'estudante' => [$cadastro ? 'sometimes' : 'prohibited', 'boolean'],
            'empresa' => [$cadastro ? 'sometimes' : 'prohibited', 'boolean'],
            'cpf' => ['nullable', 'string', 'max:14', Rule::unique('usuario', 'cpf')->ignore($idAtual)],
            'sexo' => ['nullable', 'boolean'],
            'profissao' => ['nullable', 'string', 'max:255'],
            'cnpj' => ['nullable', 'string', 'max:18', Rule::unique('usuario', 'cnpj')->ignore($idAtual)],
        ];
    }
}
