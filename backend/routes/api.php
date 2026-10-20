<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CandidaturaController;
use App\Http\Controllers\ChamadoController;
use App\Http\Controllers\CurriculoController;
use App\Http\Controllers\NoticiaController;
use App\Http\Controllers\ProjetoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\VagaController;
use Illuminate\Support\Facades\Route;

/* =========================================
   PÚBLICAS
========================================= */

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/usuario', [UsuarioController::class, 'store'])->middleware('throttle:cadastro');

// Conteúdo de vitrine pode ser lido sem login.
Route::apiResource('vaga', VagaController::class)->only(['index', 'show']);
Route::apiResource('noticia', NoticiaController::class)->only(['index', 'show'])->parameters(['noticia' => 'noticia']);
Route::apiResource('projeto', ProjetoController::class)->only(['index', 'show']);

/* =========================================
   AUTENTICADAS (token Sanctum)
========================================= */

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dados do próprio usuário: não existe rota para alterar ou excluir outra conta.
    Route::get('/usuario/me', [UsuarioController::class, 'me']);
    Route::match(['put', 'patch'], '/usuario/me', [UsuarioController::class, 'update']);
    Route::delete('/usuario/me', [UsuarioController::class, 'destroy']);
    Route::get('/usuario/{usuario}', [UsuarioController::class, 'show']);

    Route::get('/vaga/minhas', [VagaController::class, 'minhas']);
    Route::get('/vaga/{vaga}/candidaturas', [CandidaturaController::class, 'porVaga']);
    Route::apiResource('vaga', VagaController::class)->except(['index', 'show']);

    Route::apiResource('candidatura', CandidaturaController::class)->except(['show']);
    Route::apiResource('noticia', NoticiaController::class)->except(['index', 'show'])->parameters(['noticia' => 'noticia']);
    Route::apiResource('projeto', ProjetoController::class)->except(['index', 'show']);
    // Chamados: escolas/empresas abrem; laboratórios e makers/voluntários atendem.
    Route::middleware('perfil:solicitante,prestador,moderador')->group(function () {
        Route::get('/chamado', [ChamadoController::class, 'index']);
        Route::get('/chamado/opcoes', [ChamadoController::class, 'opcoes']);
        Route::get('/chamado/{chamado}', [ChamadoController::class, 'show']);
    });
    Route::middleware('perfil:solicitante')->group(function () {
        Route::post('/chamado', [ChamadoController::class, 'store']);
        Route::match(['put', 'patch'], '/chamado/{chamado}', [ChamadoController::class, 'update']);
        Route::delete('/chamado/{chamado}', [ChamadoController::class, 'destroy']);
        Route::post('/chamado/{chamado}/cancelar', [ChamadoController::class, 'cancelar']);
    });
    Route::middleware('perfil:prestador')->group(function () {
        Route::post('/chamado/{chamado}/aceitar', [ChamadoController::class, 'aceitar']);
        Route::post('/chamado/{chamado}/concluir', [ChamadoController::class, 'concluir']);
    });
    Route::apiResource('curriculo', CurriculoController::class);
});
