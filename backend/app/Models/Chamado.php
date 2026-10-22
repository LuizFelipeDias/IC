<?php

namespace App\Models;

use App\Enums\LocalAtendimento;
use App\Enums\Perfil;
use App\Enums\StatusChamado;
use App\Enums\TipoServico;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property StatusChamado $status
 * @property int $id_usuario
 * @property int|null $id_prestador
 */
class Chamado extends Model
{
    use HasFactory;

    protected $table = 'chamados';

    protected $attributes = [
        'status' => 'Aberto',
    ];

    // id_usuario, status e campos do atendimento são definidos pelo servidor.
    protected $fillable = [
        'titulo',
        'descricao',
        'data_limite',
        'tipo_servico',
        'cidade',
        'uf',
    ];

    protected function casts(): array
    {
        return [
            'data_criacao' => 'datetime',
            'data_limite' => 'date',
            'aceito_em' => 'datetime',
            'concluido_em' => 'datetime',
            'status' => StatusChamado::class,
            'tipo_servico' => TipoServico::class,
            'local_atendimento' => LocalAtendimento::class,
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function prestador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_prestador');
    }

    /**
     * Chamados que o usuário pode listar: os que abriu, os que atende e,
     * para prestadores, os que ainda estão abertos.
     */
    public function scopeVisiveisPara(Builder $query, Usuario $usuario): Builder
    {
        if ($usuario->ehModerador()) {
            return $query;
        }

        return $query->where(function (Builder $query) use ($usuario) {
            $query->where('id_usuario', $usuario->id)
                ->orWhere('id_prestador', $usuario->id);

            if ($usuario->temPerfil(Perfil::Prestador)) {
                $query->orWhere('status', StatusChamado::Aberto);
            }
        });
    }
}
