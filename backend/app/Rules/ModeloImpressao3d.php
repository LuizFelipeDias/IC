<?php

namespace App\Rules;

use App\Support\Arquivos\ArquivoInvalido;
use App\Support\Arquivos\Modelo3d;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

/**
 * Modelo STL ou 3MF validado pela estrutura real do arquivo, não pela extensão.
 */
class ModeloImpressao3d implements ValidationRule
{
    public const MAX_KB = 50 * 1024;

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile || ! $value->isValid()) {
            $fail('Envie um arquivo STL ou 3MF.');

            return;
        }

        $extensao = strtolower($value->getClientOriginalExtension());

        if (! in_array($extensao, ['stl', '3mf'], true)) {
            $fail('O modelo deve estar no formato STL ou 3MF.');

            return;
        }

        if ($value->getSize() > self::MAX_KB * 1024) {
            $fail('O modelo não pode ter mais de 50 MB.');

            return;
        }

        try {
            Modelo3d::analisar($value->getRealPath(), $extensao);
        } catch (ArquivoInvalido $e) {
            $fail($e->getMessage());
        }
    }
}
