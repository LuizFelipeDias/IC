<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ModeracaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'decisao' => ['required', 'in:aprovar,rejeitar'],
            'motivo' => ['required_if:decisao,rejeitar', 'nullable', 'string', 'max:2000'],
        ];
    }
}
