<?php

namespace App\Http\Requests;

use App\Models\Doacao;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DoacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('uf'))) {
            $this->merge(['uf' => mb_strtoupper($this->input('uf'))]);
        }
    }

    public function rules(): array
    {
        $obrigatorio = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'id_polimero' => [$obrigatorio, 'integer', 'exists:polimeros,id'],
            'tipo' => [$obrigatorio, Rule::in(Doacao::TIPOS)],
            'titulo' => [$obrigatorio, 'string', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:5000'],
            'peso_estimado_g' => [$obrigatorio, 'integer', 'min:1', 'max:1000000'],
            'cor' => ['nullable', 'string', 'max:30'],
            'cidade' => ['nullable', 'string', 'max:100'],
            'uf' => ['nullable', 'string', 'size:2', 'alpha'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
        ];
    }
}
