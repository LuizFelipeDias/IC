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
            // Espelha as constraints chk_tipo_usuario e chk_dados_consistentes do banco.
            'estudante' => [$cadastro ? 'required' : 'prohibited', 'boolean'],
            'empresa' => [$cadastro ? 'required' : 'prohibited', 'boolean', 'different:estudante'],
            'cpf' => [Rule::requiredIf($cadastro && $this->boolean('estudante')), Rule::prohibitedIf($this->boolean('empresa')), 'nullable', 'string', 'max:14', Rule::unique('usuario', 'cpf')->ignore($idAtual)],
            'sexo' => [Rule::requiredIf($cadastro && $this->boolean('estudante')), 'nullable', 'boolean'],
            'profissao' => [Rule::requiredIf($cadastro && $this->boolean('estudante')), 'nullable', 'string', 'max:255'],
            'cnpj' => [Rule::requiredIf($cadastro && $this->boolean('empresa')), Rule::prohibitedIf($this->boolean('estudante')), 'nullable', 'string', 'max:18', Rule::unique('usuario', 'cnpj')->ignore($idAtual)],
        ];
    }
}
