<?php

namespace App\Http\Requests;

use App\Enums\Disponibilidade;
use App\Enums\ModalidadePreferida;
use App\Support\Etiquetas;
use App\Support\UnidadesFederativas;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CurriculoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $obrigatorio = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'cargo' => ['nullable', 'string', 'max:255'],
            'habilidades' => ['nullable', 'string', 'max:255'],
            'competencias' => ['nullable', 'string', 'max:255'],
            'data_inicio' => ['nullable', 'date'],
            'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'],
            'texto' => [$obrigatorio, 'string', 'max:20000'],
            'cidade' => ['nullable', 'string', 'max:100'],
            'uf' => ['nullable', 'string', Rule::in(UnidadesFederativas::SIGLAS)],
            'disponibilidade' => ['nullable', Rule::enum(Disponibilidade::class)],
            'modalidade_preferida' => ['nullable', Rule::enum(ModalidadePreferida::class)],
            'portfolio_url' => ['nullable', 'string', 'max:255', 'url:https'],
            'especialidades' => ['nullable', 'array', 'max:15'],
            'especialidades.*' => ['string', 'max:60'],
            'visivel_no_banco' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'portfolio_url.url' => 'O link do portfólio deve ser um endereço https:// válido.',
        ];
    }

    public function attributes(): array
    {
        return [
            'competencias' => 'competências',
            'disponibilidade' => 'disponibilidade',
            'modalidade_preferida' => 'modalidade preferida',
            'portfolio_url' => 'link do portfólio',
            'especialidades' => 'especialidades',
            'especialidades.*' => 'especialidade',
            'visivel_no_banco' => 'visível no banco de currículos',
        ];
    }

    protected function prepareForValidation(): void
    {
        $ajustes = [];

        if ($this->has('uf')) {
            $ajustes['uf'] = UnidadesFederativas::normalizar($this->input('uf')) ?: null;
        }

        if (is_string($this->input('portfolio_url'))) {
            $ajustes['portfolio_url'] = trim($this->input('portfolio_url')) ?: null;
        }

        if ($this->has('especialidades') && (is_string($this->input('especialidades')) || is_array($this->input('especialidades')))) {
            $ajustes['especialidades'] = Etiquetas::normalizar($this->input('especialidades'));
        }

        $this->merge($ajustes);
    }
}
