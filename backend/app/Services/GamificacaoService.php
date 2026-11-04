<?php

namespace App\Services;

use App\Enums\AcaoPontuavel;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Concede pontos e selos. Idempotente: repetir a mesma ação sobre a mesma
 * origem não pontua de novo (UNIQUE pontuacao_unica no banco).
 */
class GamificacaoService
{
    public function conceder(Usuario $usuario, AcaoPontuavel $acao, Model $origem): void
    {
        DB::transaction(function () use ($usuario, $acao, $origem) {
            $inserido = DB::table('pontuacoes')->insertOrIgnore([
                'id_usuario' => $usuario->id,
                'acao' => $acao->value,
                'pontos' => $acao->pontos(),
                'origem_type' => $origem->getMorphClass(),
                'origem_id' => $origem->getKey(),
                'created_at' => now(),
            ]);

            if ($inserido === 0) {
                return;
            }

            Usuario::whereKey($usuario->id)->increment('pontos_total', $acao->pontos());

            $this->concederSelos($usuario, $acao);
        });
    }

    private function concederSelos(Usuario $usuario, AcaoPontuavel $acao): void
    {
        $realizadas = DB::table('pontuacoes')
            ->where('id_usuario', $usuario->id)
            ->where('acao', $acao->value)
            ->count();

        $selos = DB::table('selos')
            ->where('acao', $acao->value)
            ->where('meta', '<=', $realizadas)
            ->pluck('id');

        DB::table('selos_usuario')->insertOrIgnore(
            $selos->map(fn ($idSelo) => [
                'id_usuario' => $usuario->id,
                'id_selo' => $idSelo,
                'conquistado_em' => now(),
            ])->all()
        );
    }
}
