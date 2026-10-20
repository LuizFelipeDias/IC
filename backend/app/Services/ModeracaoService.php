<?php

namespace App\Services;

use App\Enums\StatusPublicacao;
use App\Models\Denuncia;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Decisões de curadoria sobre notícias e projetos, sempre registradas em "moderacoes".
 */
class ModeracaoService
{
    public function aprovar(Model $conteudo, Usuario $moderador): void
    {
        $this->decidir($conteudo, $moderador, 'aprovar', null);
    }

    public function rejeitar(Model $conteudo, Usuario $moderador, string $motivo): void
    {
        $this->decidir($conteudo, $moderador, 'rejeitar', $motivo);
    }

    /**
     * Denúncia procedente retira o conteúdo do ar (status rejeitado).
     */
    public function resolverDenuncia(Denuncia $denuncia, Usuario $moderador, bool $procedente, ?string $justificativa): void
    {
        DB::transaction(function () use ($denuncia, $moderador, $procedente, $justificativa) {
            $denuncia->forceFill([
                'status' => $procedente ? 'procedente' : 'improcedente',
                'id_moderador' => $moderador->id,
                'resolvida_em' => now(),
            ])->save();

            if ($procedente && $denuncia->denunciavel !== null) {
                $this->rejeitar($denuncia->denunciavel, $moderador, $justificativa ?? 'Denúncia procedente.');
            }
        });
    }

    private function decidir(Model $conteudo, Usuario $moderador, string $decisao, ?string $motivo): void
    {
        DB::transaction(function () use ($conteudo, $moderador, $decisao, $motivo) {
            $aprovado = $decisao === 'aprovar';

            $conteudo->forceFill([
                'status' => $aprovado ? StatusPublicacao::Publicado : StatusPublicacao::Rejeitado,
                'motivo_rejeicao' => $motivo,
                'id_moderador' => $moderador->id,
                'moderado_em' => now(),
                // A data de publicação passa a ser a da aprovação.
                ...($aprovado ? ['data_publicacao' => now()] : []),
            ])->save();

            $conteudo->moderacoes()->create([
                'id_moderador' => $moderador->id,
                'decisao' => $decisao,
                'justificativa' => $motivo,
            ]);
        });
    }
}
