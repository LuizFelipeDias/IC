<?php

use App\Support\Documento;

it('aceita CPF e CNPJ válidos com ou sem máscara', function () {
    expect(Documento::cpfValido('529.982.247-25'))->toBeTrue()
        ->and(Documento::cpfValido('52998224725'))->toBeTrue()
        ->and(Documento::cnpjValido('11.222.333/0001-81'))->toBeTrue()
        ->and(Documento::cnpjValido('11222333000181'))->toBeTrue();
});

it('rejeita dígitos verificadores errados, sequências repetidas e tamanhos inválidos', function (string $cpf, string $cnpj) {
    expect(Documento::cpfValido($cpf))->toBeFalse()
        ->and(Documento::cnpjValido($cnpj))->toBeFalse();
})->with([
    ['529.982.247-24', '11.222.333/0001-80'],
    ['111.111.111-11', '00.000.000/0000-00'],
    ['1234', '123'],
    ['', ''],
]);

it('gera documentos válidos e formata com máscara', function () {
    foreach (range(1, 50) as $_) {
        expect(Documento::cpfValido(Documento::gerarCpf()))->toBeTrue()
            ->and(Documento::cnpjValido(Documento::gerarCnpj()))->toBeTrue();
    }

    expect(Documento::formatarCpf('52998224725'))->toBe('529.982.247-25')
        ->and(Documento::formatarCnpj('11222333000181'))->toBe('11.222.333/0001-81')
        ->and(Documento::somenteDigitos('11.222.333/0001-81'))->toBe('11222333000181');
});
