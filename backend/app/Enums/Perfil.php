<?php

namespace App\Enums;

/**
 * Perfis de acesso usados pelo middleware "perfil" e pelo front-end.
 * A regra de quem tem cada perfil fica em Usuario::temPerfil().
 */
enum Perfil: string
{
    /** Abre chamados: escolas e empresas (CNPJ). */
    case Solicitante = 'solicitante';

    /** Aceita e atende chamados: laboratórios e makers/voluntários. */
    case Prestador = 'prestador';

    /** Publica vagas: pessoas jurídicas (empresa, escola, laboratório). */
    case Contratante = 'contratante';

    /** Candidata-se a vagas: pessoas físicas. */
    case Candidato = 'candidato';

    /** Publica notícias: pessoas jurídicas e moderadores. */
    case Publicador = 'publicador';

    /** Aprova ou rejeita notícias e projetos. */
    case Moderador = 'moderador';
}
