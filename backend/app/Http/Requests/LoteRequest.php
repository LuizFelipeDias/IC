<?php

namespace App\Http\Requests;

use App\Enums\StatusColeta;
use App\Models\SolicitacaoColeta;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * Formação de lote: as coletas precisam ser do próprio laboratório, estar
 * concluídas, ser do mesmo polímero e ter saldo de peso não usado em outros lotes.
 */
class LoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_polimero' => ['required', 'integer', 'exists:polimeros,id'],
            'diametro_nominal_mm' => ['required', 'numeric', 'between:1,3'],
            'cor' => ['nullable', 'string', 'max:30'],
            'coletas' => ['required', 'array', 'min:1', 'max:50'],
            'coletas.*.id' => ['required', 'integer', 'distinct'],
            'coletas.*.peso_g' => ['required', 'integer', 'min:1'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $coletas = SolicitacaoColeta::with(['doacao', 'lotes'])
                ->whereIn('id', collect($this->input('coletas'))->pluck('id'))
                ->get()
                ->keyBy('id');

            foreach ($this->input('coletas') as $i => $item) {
                $coleta = $coletas->get($item['id']);

                if ($coleta === null || $coleta->id_laboratorio !== $this->user()->id || $coleta->status !== StatusColeta::Concluida) {
                    $validator->errors()->add("coletas.{$i}.id", 'Use apenas coletas concluídas pelo seu laboratório.');

                    continue;
                }

                if ($coleta->doacao->id_polimero !== (int) $this->input('id_polimero')) {
                    $validator->errors()->add("coletas.{$i}.id", 'Todas as coletas do lote devem ser do mesmo polímero do lote.');
                }

                $saldo = $coleta->peso_recebido_g - $coleta->lotes->sum('pivot.peso_g');
                if ($item['peso_g'] > $saldo) {
                    $validator->errors()->add("coletas.{$i}.peso_g", "A coleta #{$coleta->id} tem apenas {$saldo} g disponíveis.");
                }
            }
        }];
    }
}
