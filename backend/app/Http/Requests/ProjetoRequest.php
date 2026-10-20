<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjetoRequest extends FormRequest
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
            'tema' => [$obrigatorio, 'string', 'max:100'],
            'empresa' => ['nullable', 'string', 'max:255'],
            'texto' => [$obrigatorio, 'string', 'max:50000'],
        ];
    }
}
