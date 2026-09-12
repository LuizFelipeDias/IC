<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UsuarioRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nome' => ['required'],
            'email' => ['required'],
            'telefone' => ['required'],
            'senha' => ['required'],
            'estudante' => ['boolean'],
            'empresa' => ['boolean'],
            'cpf' => ['nullable'],
            'sexo' => ['nullable', 'boolean'],
            'profissao' => ['nullable'],
            'cnpj' => ['nullable'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
