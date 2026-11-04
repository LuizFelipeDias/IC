<?php

namespace App\Enums;

/**
 * Demandas previstas no módulo "Pedidos de escolas públicas".
 */
enum TipoServico: string
{
    case ImpressaoPeca = 'impressao_peca';
    case TreinamentoImpressao = 'treinamento_impressao';
    case Scanner3d = 'scanner_3d';
    case Modelagem = 'modelagem';
    case Manutencao = 'manutencao';
    case Outro = 'outro';

    public function rotulo(): string
    {
        return match ($this) {
            self::ImpressaoPeca => 'Impressão de peça',
            self::TreinamentoImpressao => 'Treinamento em impressão 3D',
            self::Scanner3d => 'Scanner 3D',
            self::Modelagem => 'Modelagem 3D',
            self::Manutencao => 'Manutenção de impressora',
            self::Outro => 'Outro',
        };
    }
}
