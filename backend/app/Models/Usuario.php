<?php

namespace App\Models;

use Database\Factories\UsuarioFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

use Laravel\Sanctum\HasApiTokens;

#[Fillable(['nome', 'email', 'telefone', 'senha', 'estudante', 'empresa', 'cpf', 'sexo', 'profissao', 'cnpj',])]
#[Hidden(['senha', 'remember_token'])]

/**
 * @property string $senha
 * @property string $email
 */

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
}
