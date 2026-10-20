<?php

namespace App\Models;

use App\Enums\PapelUsuario;
use App\Enums\Perfil;
use App\Enums\TipoUsuario;
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
 * @property TipoUsuario $tipo_usuario
 * @property PapelUsuario $papel
 * @property bool $prestador_servico
 */
#[Fillable([
    'nome', 'email', 'telefone', 'senha', 'estudante', 'empresa', 'cpf', 'sexo', 'profissao', 'cnpj',
    'tipo_usuario', 'prestador_servico', 'codigo_inep',
])]
#[Hidden(['senha', 'remember_token'])]
class Usuario extends Authenticatable
{
    /** @use HasFactory<UsuarioFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuario';

    /** Mesmos defaults do banco, para o model recém-criado já tê-los. */
    protected $attributes = [
        'tipo_usuario' => 'pessoa_fisica',
        'papel' => 'usuario',
        'prestador_servico' => false,
    ];

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
            'tipo_usuario' => TipoUsuario::class,
            'papel' => PapelUsuario::class,
            'prestador_servico' => 'boolean',
        ];
    }

    public function ehPessoaFisica(): bool
    {
        return $this->tipo_usuario === TipoUsuario::PessoaFisica;
    }

    public function ehModerador(): bool
    {
        return in_array($this->papel, [PapelUsuario::Moderador, PapelUsuario::Admin], true);
    }

    /**
     * Fonte única das regras de acesso por tipo de usuário (RBAC).
     */
    public function temPerfil(Perfil $perfil): bool
    {
        return match ($perfil) {
            Perfil::Solicitante => in_array($this->tipo_usuario, [TipoUsuario::Escola, TipoUsuario::Empresa], true),
            Perfil::Prestador => $this->tipo_usuario === TipoUsuario::Laboratorio
                || ($this->ehPessoaFisica() && $this->prestador_servico),
            Perfil::Contratante => $this->tipo_usuario->ehPessoaJuridica(),
            Perfil::Candidato => $this->ehPessoaFisica(),
            Perfil::Publicador => $this->tipo_usuario->ehPessoaJuridica() || $this->ehModerador(),
            Perfil::Moderador => $this->ehModerador(),
        };
    }

    /**
     * Mapa perfil => bool enviado ao front para mostrar ou esconder ações.
     *
     * @return array<string, bool>
     */
    public function perfis(): array
    {
        return collect(Perfil::cases())
            ->mapWithKeys(fn (Perfil $perfil) => [$perfil->value => $this->temPerfil($perfil)])
            ->all();
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
