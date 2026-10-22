<?php

namespace App\Policies;

use App\Models\AnexoDocumento;
use App\Models\Usuario;
use Illuminate\Support\Facades\Gate;

class AnexoDocumentoPolicy
{
    /**
     * Quem pode ver o registro dono do anexo (projeto publicado, doação, lote...)
     * pode baixá-lo, desde que o antivírus não o tenha rejeitado.
     */
    public function view(?Usuario $usuario, AnexoDocumento $anexo): bool
    {
        return $anexo->status_verificacao !== 'rejeitado'
            && $anexo->anexavel !== null
            && Gate::forUser($usuario)->allows('view', $anexo->anexavel);
    }

    public function delete(Usuario $usuario, AnexoDocumento $anexo): bool
    {
        return $anexo->id_usuario === $usuario->id || $usuario->ehModerador();
    }
}
