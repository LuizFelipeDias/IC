<?php

namespace App\Http\Middleware;

use App\Enums\Perfil;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe a rota a usuários com ao menos um dos perfis informados.
 *
 * Uso: ->middleware('perfil:solicitante,prestador')
 *
 * O middleware responde "quem pode usar a rota"; as Policies respondem
 * "sobre qual registro" (dono, status do chamado etc.).
 */
class GarantePerfil
{
    public function handle(Request $request, Closure $next, string ...$perfis): Response
    {
        $usuario = $request->user();

        $autorizado = $usuario !== null && collect($perfis)
            ->map(fn (string $perfil) => Perfil::from($perfil))
            ->contains(fn (Perfil $perfil) => $usuario->temPerfil($perfil));

        abort_unless($autorizado, Response::HTTP_FORBIDDEN, 'Seu perfil não permite esta ação.');

        return $next($request);
    }
}
