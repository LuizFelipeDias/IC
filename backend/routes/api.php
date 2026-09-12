<?php

use App\Http\Controllers\CandidaturaController;
use App\Http\Controllers\CurriculoController;
use App\Http\Controllers\ChamadoController;
use App\Http\Controllers\NoticiaController;
use App\Http\Controllers\ProjetoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\VagaController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

/* =========================================
   AUTENTICAÇÃO E USUÁRIO LOGADO
========================================= */

// Rota para fazer login e gerar o token
Route::post('/login', [UsuarioController::class, 'login']);

// Rota para pegar os dados do usuário que já está logado
Route::get('/usuario/me', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


/* =========================================
   ROTAS DE USUÁRIO (CRUD)
========================================= */
Route::get('/usuario', [UsuarioController::class, 'index']);
Route::post('/usuario', [UsuarioController::class, 'store']);
Route::get('/usuario/{usuario}', [UsuarioController::class, 'show']);
Route::put('/usuario/{usuario}', [UsuarioController::class, 'update']);
Route::delete('/usuario/{usuario}', [UsuarioController::class, 'destroy']);


/* =========================================
   ROTAS GET (Listagem)
========================================= */
Route::get('/vaga', [VagaController::class, 'index']);
Route::get('/noticia', [NoticiaController::class, 'index']);
Route::get('/projeto', [ProjetoController::class, 'index']);
Route::get('/chamado', [ChamadoController::class, 'index']);
Route::get('/curriculo', [CurriculoController::class, 'index']); // <- Corrigido
Route::get('/candidatura', [CandidaturaController::class, 'index']);


/* =========================================
   ROTAS POST (Criação)
========================================= */
Route::post('/vaga', [VagaController::class, 'store']);
Route::post('/noticia', [NoticiaController::class, 'store']);
Route::post('/projeto', [ProjetoController::class, 'store']);
Route::post('/chamado', [ChamadoController::class, 'store']);
Route::post('/curriculo', [CurriculoController::class, 'store']);
Route::post('/candidatura', [CandidaturaController::class, 'store']);


/* =========================================
   ROTAS DELETE (Exclusão)
========================================= */
Route::delete('/vaga/{vaga}', [VagaController::class, 'destroy']);
Route::delete('/noticia/{noticia}', [NoticiaController::class, 'destroy']);
Route::delete('/projeto/{projeto}', [ProjetoController::class, 'destroy']);
Route::delete('/chamado/{chamado}', [ChamadoController::class, 'destroy']);
Route::delete('/curriculo/{curriculo}', [CurriculoController::class, 'destroy']);
Route::delete('/candidatura/{candidatura}', [CandidaturaController::class, 'destroy']);
