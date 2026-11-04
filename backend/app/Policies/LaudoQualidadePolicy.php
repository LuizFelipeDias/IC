<?php

namespace App\Policies;

use App\Models\LaudoQualidade;
use App\Models\Usuario;

class LaudoQualidadePolicy
{
    /**
     * O laudo é público: é ele que dá credibilidade ao filamento reciclado na página do QR Code.
     */
    public function view(?Usuario $usuario, LaudoQualidade $laudo): bool
    {
        return true;
    }
}
