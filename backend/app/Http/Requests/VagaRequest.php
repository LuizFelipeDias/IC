<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VagaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $obrigatorio = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'titulo' => [$obrigatorio, 'string', 'max:255'],
            'texto' => [$obrigatorio, 'string', 'max:20000'],
            'tema' => ['nullable', 'string', 'max:100'],
            'cep' => ['nullable', 'string', 'max:10'],
            'cidade' => ['nullable', 'string', 'max:100'],
        ];
    }
}
