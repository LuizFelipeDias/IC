<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CurriculoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'id_usuario' => ['nullable'],
            'cargo' => ['nullable'],
            'habilidades' => ['nullable'],
            'competencias' => ['nullable'],
            'data_inicio' => ['nullable', 'date'],
            'data_fim' => ['nullable', 'date'],
            'texto' => ['required'],
            'usuario' => ['required'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
