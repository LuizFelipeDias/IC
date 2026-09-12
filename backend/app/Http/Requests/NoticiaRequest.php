<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NoticiaRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'id_usuario' => ['required'],
            'titulo' => ['required'],
            'tema' => ['required'],
            'texto' => ['required'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
