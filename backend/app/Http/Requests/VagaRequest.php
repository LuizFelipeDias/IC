<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VagaRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'id_usuario' => ['required', 'integer'],
            'titulo' => ['required'],
            'tema' => ['required'],
            'cep' => ['required'],
            'cidade' => ['required'],
            'texto' => ['required'],
            'data_publicacao' => ['required', 'date'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
