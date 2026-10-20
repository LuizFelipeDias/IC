<?php

namespace App\Enums;

enum AcaoPontuavel: string
{
    case ChamadoConcluido = 'chamado_concluido';
    case ProjetoPublicado = 'projeto_publicado';
    case ColetaConcluida = 'coleta_concluida';
    case DoacaoEntregue = 'doacao_entregue';

    public function pontos(): int
    {
        return match ($this) {
            self::ChamadoConcluido => 50,
            self::ColetaConcluida => 30,
            self::ProjetoPublicado => 20,
            self::DoacaoEntregue => 15,
        };
    }
}
