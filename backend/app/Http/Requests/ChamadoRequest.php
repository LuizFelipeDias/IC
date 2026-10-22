<?php

namespace App\Http\Requests;

use App\Enums\TipoServico;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Dados do chamado. O status muda apenas pelas ações aceitar/concluir/cancelar.
 */
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
            'tipo_servico' => [$obrigatorio, Rule::enum(TipoServico::class)],
            'data_limite' => [$obrigatorio, 'date', 'after_or_equal:today'],
            'cidade' => ['nullable', 'string', 'max:100'],
            'uf' => ['nullable', 'string', 'size:2', 'alpha'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('uf'))) {
            $this->merge(['uf' => mb_strtoupper($this->input('uf'))]);
        }
    }
}
