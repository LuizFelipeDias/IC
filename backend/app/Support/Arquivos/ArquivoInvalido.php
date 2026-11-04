<?php

namespace App\Support\Arquivos;

use RuntimeException;

/**
 * Arquivo enviado que não corresponde ao formato declarado ou viola um limite de segurança.
 */
class ArquivoInvalido extends RuntimeException {}
