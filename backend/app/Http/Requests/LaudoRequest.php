<?php

namespace App\Http\Requests;

use App\Models\LaudoQualidade;
use App\Rules\LaudoPdf;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LaudoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'arquivo' => ['required', new LaudoPdf],
            'resultado' => ['required', Rule::in(LaudoQualidade::RESULTADOS)],
            'diametro_medio_mm' => ['required', 'numeric', 'between:0.5,5'],
            'tolerancia_mm' => ['required', 'numeric', 'between:0,1'],
            'ovalidade_mm' => ['nullable', 'numeric', 'between:0,1'],
            'resistencia_tracao_mpa' => ['nullable', 'numeric', 'between:0,500'],
            'alongamento_pct' => ['nullable', 'numeric', 'between:0,1000'],
            'temp_impressao_min' => ['nullable', 'integer', 'between:100,450'],
            'temp_impressao_max' => ['nullable', 'integer', 'between:100,450', 'gte:temp_impressao_min'],
            'umidade_pct' => ['nullable', 'numeric', 'between:0,100'],
            'observacoes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
