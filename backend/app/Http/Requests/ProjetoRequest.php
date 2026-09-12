<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjetoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'id_usuario' => ['required', 'integer'],
            'titulo' => ['required'],
            'tema' => ['required'],
            'empresa' => ['required'],
            'texto' => ['required'],
            'data_publicacao' => ['required'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
