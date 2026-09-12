<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChamadoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'id_usuario' => ['required', 'integer'],
            'titulo' => ['required'],
            'descricao' => ['required'],
            'data_criacao' => ['required', 'date'],
            'data_limite' => ['required', 'date'],
            'status' => ['required'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
