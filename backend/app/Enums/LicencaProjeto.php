<?php

namespace App\Enums;

/**
 * Licenças de uso aceitas no repositório (Creative Commons).
 */
enum LicencaProjeto: string
{
    case CcBy = 'cc-by';
    case CcBySa = 'cc-by-sa';
    case CcByNc = 'cc-by-nc';
    case CcByNcSa = 'cc-by-nc-sa';
    case Cc0 = 'cc0';
}
