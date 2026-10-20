<?php

namespace App\Http\Requests;

use App\Enums\TipoUsuario;
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

    /**
     * No cadastro, os booleanos estudante/empresa exigidos pelo banco são
     * derivados do tipo_usuario (aceita também o formato antigo, só com os booleanos).
     */
    protected function prepareForValidation(): void
    {
        if (! $this->isMethod('post')) {
            return;
        }

        $tipo = $this->input('tipo_usuario')
            ?? ($this->boolean('empresa') ? TipoUsuario::Empresa->value : TipoUsuario::PessoaFisica->value);

        $pessoaFisica = $tipo === TipoUsuario::PessoaFisica->value;

        $this->merge([
            'tipo_usuario' => $tipo,
            'estudante' => $pessoaFisica,
            'empresa' => ! $pessoaFisica,
        ]);
    }

    public function rules(): array
    {
        $cadastro = $this->isMethod('post');
        $obrigatorio = $cadastro ? 'required' : 'sometimes';
        $idAtual = $this->user()?->id;
        $tipo = TipoUsuario::tryFrom((string) $this->input('tipo_usuario'));
        $pessoaFisica = $cadastro ? $tipo === TipoUsuario::PessoaFisica : (bool) $this->user()?->ehPessoaFisica();

        return [
            'nome' => [$obrigatorio, 'string', 'max:255'],
            'email' => [$obrigatorio, 'string', 'email:rfc', 'max:255', Rule::unique('usuario', 'email')->ignore($idAtual)],
            'telefone' => [$obrigatorio, 'string', 'max:20'],
            'senha' => [$obrigatorio, 'string', Password::min(8)->mixedCase()->numbers()->symbols()],
            // Trocar a senha exige confirmar a atual.
            'senha_atual' => [Rule::requiredIf(! $cadastro && $this->filled('senha')), 'nullable', 'current_password:sanctum'],

            // O tipo é escolhido no cadastro; mudá-lo depois burlaria as permissões.
            'tipo_usuario' => [$cadastro ? 'required' : 'prohibited', Rule::enum(TipoUsuario::class)],
            'estudante' => [$cadastro ? 'required' : 'prohibited', 'boolean'],
            'empresa' => [$cadastro ? 'required' : 'prohibited', 'boolean'],

            // Espelha as constraints chk_dados_consistentes e chk_prestador_pessoa_fisica do banco.
            'cpf' => [Rule::requiredIf($cadastro && $pessoaFisica), Rule::prohibitedIf(! $pessoaFisica), 'nullable', 'string', 'max:14', Rule::unique('usuario', 'cpf')->ignore($idAtual)],
            'sexo' => [Rule::requiredIf($cadastro && $pessoaFisica), Rule::prohibitedIf(! $pessoaFisica), 'nullable', 'boolean'],
            'profissao' => [Rule::requiredIf($cadastro && $pessoaFisica), 'nullable', 'string', 'max:255'],
            'cnpj' => [Rule::requiredIf($cadastro && ! $pessoaFisica), Rule::prohibitedIf($pessoaFisica), 'nullable', 'string', 'max:18', Rule::unique('usuario', 'cnpj')->ignore($idAtual)],
            'prestador_servico' => [Rule::prohibitedIf(! $pessoaFisica), 'sometimes', 'boolean'],
            'codigo_inep' => [
                Rule::requiredIf($cadastro && $tipo === TipoUsuario::Escola),
                Rule::prohibitedIf($cadastro && $tipo !== TipoUsuario::Escola),
                'nullable', 'digits:8', Rule::unique('usuario', 'codigo_inep')->ignore($idAtual),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'codigo_inep.required' => 'Informe o código INEP da escola.',
            'prestador_servico.prohibited' => 'Somente pessoas físicas se cadastram como maker/voluntário; laboratórios já atendem chamados.',
        ];
    }
}
