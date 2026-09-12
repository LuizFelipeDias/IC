<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CandidaturaRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'usuario_id' => ['required', 'exists:usuario'],
            'vaga_id' => ['required', 'exists:vagas'],
            'status' => ['boolean'],
            'data_candidatura' => ['required'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
