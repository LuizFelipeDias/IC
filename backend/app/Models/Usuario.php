<?php

namespace App\Models;

use Database\Factories\UsuarioFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $senha
 * @property string $email
 * @property bool $empresa
 * @property bool $estudante
 */
#[Fillable(['nome', 'email', 'telefone', 'senha', 'estudante', 'empresa', 'cpf', 'sexo', 'profissao', 'cnpj'])]
#[Hidden(['senha', 'remember_token'])]
class Usuario extends Authenticatable
{
    /** @use HasFactory<UsuarioFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuario';

    public function getAuthPasswordName(): string
    {
        return 'senha';
    }

    protected function casts(): array
    {
        return [
            'estudante' => 'boolean',
            'empresa' => 'boolean',
            'sexo' => 'boolean',
            'senha' => 'hashed',
        ];
    }

    /**
     * Perfil textual usado pelo front para escolher a visão (empregador/candidato).
     */
    public function tipo(): string
    {
        return match (true) {
            $this->empresa => 'empresa',
            $this->estudante => 'estudante',
            default => 'usuario',
        };
    }

    public function vagas(): HasMany
    {
        return $this->hasMany(Vaga::class, 'id_usuario');
    }

    public function candidaturas(): HasMany
    {
        return $this->hasMany(Candidatura::class, 'id_usuario');
    }

    public function curriculos(): HasMany
    {
        return $this->hasMany(Curriculo::class, 'id_usuario');
    }

    public function noticias(): HasMany
    {
        return $this->hasMany(Noticia::class, 'id_usuario');
    }

    public function projetos(): HasMany
    {
        return $this->hasMany(Projeto::class, 'id_usuario');
    }

    public function chamados(): HasMany
    {
        return $this->hasMany(Chamado::class, 'id_usuario');
    }
}
