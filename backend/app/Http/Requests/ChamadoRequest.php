<?php

namespace App\Http\Requests;

use App\Models\Chamado;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChamadoRequest extends FormRequest
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
            'descricao' => [$obrigatorio, 'string', 'max:10000'],
            'data_limite' => ['nullable', 'date', 'after_or_equal:today'],
            'status' => ['sometimes', Rule::in(Chamado::STATUS)],
        ];
    }
}
