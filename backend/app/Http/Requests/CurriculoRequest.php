<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CurriculoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $obrigatorio = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'cargo' => ['nullable', 'string', 'max:255'],
            'habilidades' => ['nullable', 'string', 'max:5000'],
            'competencias' => ['nullable', 'string', 'max:5000'],
            'data_inicio' => ['nullable', 'date'],
            'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'],
            'texto' => [$obrigatorio, 'string', 'max:20000'],
        ];
    }
}
