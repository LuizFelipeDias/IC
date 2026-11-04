<?php

namespace App\Http\Requests;

use App\Enums\AreaProjeto;
use App\Enums\LicencaProjeto;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProjetoRequest extends FormRequest
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
            'tema' => ['nullable', 'string', 'max:100'],
            'empresa' => ['nullable', 'string', 'max:255'],
            'texto' => [$obrigatorio, 'string', 'max:50000'],
            // Requisito: catálogo por área e com licença de uso clara.
            'area' => [$obrigatorio, Rule::enum(AreaProjeto::class)],
            'licenca' => [$obrigatorio, Rule::enum(LicencaProjeto::class)],
        ];
    }
}
