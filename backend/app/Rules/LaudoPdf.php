<?php

namespace App\Rules;

use App\Support\Arquivos\ArquivoInvalido;
use App\Support\Arquivos\Pdf;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

/**
 * PDF de laudo: assinatura %PDF-, até 10 MB e sem scripts ou execução de programas.
 */
class LaudoPdf implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile || ! $value->isValid() || strtolower($value->getClientOriginalExtension()) !== 'pdf') {
            $fail('O laudo deve ser um arquivo PDF.');

            return;
        }

        if ($value->getSize() > 10 * 1024 * 1024) {
            $fail('O laudo não pode ter mais de 10 MB.');

            return;
        }

        try {
            Pdf::validar($value->getRealPath());
        } catch (ArquivoInvalido $e) {
            $fail($e->getMessage());
        }
    }
}
