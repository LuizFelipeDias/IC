<?php

namespace App\Models\Concerns;

use App\Enums\StatusPublicacao;
use App\Models\Moderacao;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Conteúdo que só fica público depois de aprovado por um moderador.
 *
 * @property StatusPublicacao $status
 * @property int|null $id_usuario
 */
trait Moderavel
{
    public function initializeModeravel(): void
    {
        $this->mergeCasts([
            'status' => StatusPublicacao::class,
            'moderado_em' => 'datetime',
        ]);
    }

    public function moderador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_moderador');
    }

    public function moderacoes(): MorphMany
    {
        return $this->morphMany(Moderacao::class, 'moderavel');
    }

    public function scopePublicados(Builder $query): Builder
    {
        return $query->where('status', StatusPublicacao::Publicado);
    }

    public function estaPublicado(): bool
    {
        return $this->status === StatusPublicacao::Publicado;
    }

    public function ehAutor(?Usuario $usuario): bool
    {
        return $usuario !== null && $this->id_usuario === $usuario->id;
    }
}
