<?php

namespace App\Enums;

/**
 * Perfis de acesso usados pelo middleware "perfil" e pelo front-end.
 * A regra de quem tem cada perfil fica em Usuario::temPerfil().
 * Os perfis institucionais exigem cadastro verificado por um moderador.
 */
enum Perfil: string
{
    /** Abre chamados: escolas e empresas (CNPJ) verificadas. */
    case Solicitante = 'solicitante';

    /** Aceita e atende chamados: laboratórios verificados e makers/voluntários. */
    case Prestador = 'prestador';

    /** Publica vagas: pessoas jurídicas verificadas (empresa, escola, laboratório). */
    case Contratante = 'contratante';

    /** Candidata-se a vagas: pessoas físicas. */
    case Candidato = 'candidato';

    /** Publica notícias: pessoas jurídicas verificadas e moderadores. */
    case Publicador = 'publicador';

    /** Recebe resíduos, produz lotes de filamento e emite laudos: laboratórios verificados. */
    case Receptor = 'receptor';

    /** Aprova ou rejeita conteúdo e cadastros de instituições. */
    case Moderador = 'moderador';
}
