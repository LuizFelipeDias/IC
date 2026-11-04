<?php

namespace App\Policies;

use App\Models\LoteFilamento;
use App\Models\Usuario;

/**
 * Gestão do lote é do laboratório que o produziu. A leitura pública é feita
 * pela página de rastreio, que não expõe dados pessoais.
 */
class LoteFilamentoPolicy
{
    public function view(Usuario $usuario, LoteFilamento $lote): bool
    {
        return $lote->id_laboratorio === $usuario->id || $usuario->ehModerador();
    }

    public function update(Usuario $usuario, LoteFilamento $lote): bool
    {
        return $lote->id_laboratorio === $usuario->id;
    }
}
