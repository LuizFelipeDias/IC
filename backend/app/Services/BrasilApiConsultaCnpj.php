<?php

namespace App\Services;

use App\Contracts\ConsultaCnpj;
use App\Support\Documento;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Dados públicos da Receita Federal via BrasilAPI (sem chave de acesso).
 */
class BrasilApiConsultaCnpj implements ConsultaCnpj
{
    public function consultar(string $cnpj): ?array
    {
        try {
            $resposta = Http::acceptJson()
                ->timeout(6)
                ->get('https://brasilapi.com.br/api/cnpj/v1/'.Documento::somenteDigitos($cnpj));
        } catch (ConnectionException) {
            return null;
        }

        if (! $resposta->successful()) {
            return null;
        }

        return [
            'razao_social' => (string) $resposta->json('razao_social'),
            'situacao' => (string) $resposta->json('descricao_situacao_cadastral'),
            'municipio' => $resposta->json('municipio'),
            'uf' => $resposta->json('uf'),
            'abertura' => $resposta->json('data_inicio_atividade'),
        ];
    }
}
