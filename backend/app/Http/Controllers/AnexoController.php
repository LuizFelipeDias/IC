<?php

namespace App\Http\Controllers;

use App\Models\AnexoDocumento;
use App\Services\Anexos\ArmazenamentoAnexos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

/**
 * Download de anexos por link temporário assinado: o disco é privado e o link
 * expira, então arquivos não ficam expostos nem podem ser compartilhados indefinidamente.
 */
class AnexoController extends Controller
{
    public function link(Request $request, AnexoDocumento $anexo)
    {
        Gate::forUser($request->user('sanctum'))->authorize('view', $anexo);

        $expiraEm = now()->addMinutes(10);

        return response()->json([
            'url' => URL::temporarySignedRoute('anexo.arquivo', $expiraEm, ['anexo' => $anexo->id]),
            'expira_em' => $expiraEm,
        ]);
    }

    /**
     * Rota protegida pelo middleware "signed": só responde a links gerados acima.
     */
    public function arquivo(AnexoDocumento $anexo)
    {
        abort_if($anexo->status_verificacao === 'rejeitado', 404);

        $disco = Storage::disk($anexo->disco);
        abort_unless($disco->exists($anexo->url_arquivo), 404);

        $cabecalhos = ['Content-Type' => $anexo->mime, 'X-Content-Type-Options' => 'nosniff'];

        return $anexo->tipo_documento === 'imagem'
            ? $disco->response($anexo->url_arquivo, $anexo->nome_arquivo, $cabecalhos + ['Cache-Control' => 'private, max-age=1800'])
            : $disco->download($anexo->url_arquivo, $anexo->nome_arquivo, $cabecalhos);
    }

    public function destroy(AnexoDocumento $anexo, ArmazenamentoAnexos $armazenamento)
    {
        Gate::authorize('delete', $anexo);

        $armazenamento->remover($anexo);

        return response()->noContent();
    }
}
