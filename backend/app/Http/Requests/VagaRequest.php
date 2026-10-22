<?php

namespace App\Http\Requests;

use App\Enums\ModalidadeTrabalho;
use App\Enums\NivelVaga;
use App\Enums\TipoContrato;
use App\Models\Vaga;
use App\Support\Etiquetas;
use App\Support\UnidadesFederativas;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Dados da vaga. O status muda apenas pela ação "encerrar".
 */
class VagaRequest extends FormRequest
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
            'texto' => [$obrigatorio, 'string', 'max:20000'],
            'tema' => ['nullable', 'string', 'max:100'],
            'cep' => ['nullable', 'string', 'max:10'],
            'cidade' => ['nullable', 'string', 'max:100'],
            'uf' => ['nullable', 'string', Rule::in(UnidadesFederativas::SIGLAS)],
            'modalidade' => [$obrigatorio, Rule::enum(ModalidadeTrabalho::class)],
            'tipo_contrato' => [$obrigatorio, Rule::enum(TipoContrato::class)],
            'nivel' => [$obrigatorio, Rule::enum(NivelVaga::class)],
            'salario_min' => ['nullable', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'salario_max' => ['nullable', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'habilidades' => ['nullable', 'array', 'max:20'],
            'habilidades.*' => ['string', 'max:60'],
            'encerra_em' => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }

    /**
     * A faixa salarial é conferida também contra o valor já gravado (PATCH só com um dos lados).
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->hasAny(['salario_min', 'salario_max'])) {
                    return;
                }

                $vaga = $this->route('vaga');
                $atual = fn (string $campo) => $vaga instanceof Vaga ? $vaga->getAttribute($campo) : null;
                $minimo = $this->has('salario_min') ? $this->input('salario_min') : $atual('salario_min');
                $maximo = $this->has('salario_max') ? $this->input('salario_max') : $atual('salario_max');

                if ($minimo !== null && $maximo !== null && (float) $maximo < (float) $minimo) {
                    $validator->errors()->add('salario_max', 'O salário máximo deve ser maior ou igual ao salário mínimo.');
                }
            },
        ];
    }

    public function attributes(): array
    {
        return [
            'tipo_contrato' => 'tipo de contrato',
            'nivel' => 'nível',
            'salario_min' => 'salário mínimo',
            'salario_max' => 'salário máximo',
            'habilidades.*' => 'habilidade',
            'encerra_em' => 'data de encerramento',
        ];
    }

    protected function prepareForValidation(): void
    {
        $ajustes = [];

        if ($this->has('uf')) {
            $ajustes['uf'] = UnidadesFederativas::normalizar($this->input('uf')) ?: null;
        }

        foreach (['salario_min', 'salario_max'] as $campo) {
            if ($this->input($campo) === '') {
                $ajustes[$campo] = null;
            }
        }

        // Aceita "Fusion 360, Cura" ou ["Fusion 360", "Cura"]; remove repetidos e vazios.
        if ($this->has('habilidades') && (is_string($this->input('habilidades')) || is_array($this->input('habilidades')))) {
            $ajustes['habilidades'] = Etiquetas::normalizar($this->input('habilidades'));
        }

        $this->merge($ajustes);
    }
}
