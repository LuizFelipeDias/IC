<?php

namespace App\Http\Controllers;

use App\Http\Resources\RastreioLoteResource;
use App\Models\LoteFilamento;

/**
 * Destino do QR Code impresso no carretel de filamento reciclado.
 */
class RastreioController extends Controller
{
    public function __invoke(LoteFilamento $lote)
    {
        $lote->load([
            'polimero',
            'laboratorio:id,nome',
            'coletas.doacao:id,tipo,cidade',
            'eventos' => fn ($query) => $query->orderBy('ocorrido_em'),
            'laudos' => fn ($query) => $query->latest('emitido_em'),
            'laudos.laboratorio:id,nome',
        ]);

        return new RastreioLoteResource($lote);
    }
}
