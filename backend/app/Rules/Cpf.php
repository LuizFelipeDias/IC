<?php

namespace App\Rules;

use App\Support\Documento;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Cpf implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! Documento::cpfValido(is_string($value) ? $value : null)) {
            $fail('O CPF informado não é válido.');
        }
    }
}
