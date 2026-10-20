<?php

use App\Http\Controllers\AnexoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CandidaturaController;
use App\Http\Controllers\ChamadoController;
use App\Http\Controllers\CurriculoController;
use App\Http\Controllers\DenunciaController;
use App\Http\Controllers\NoticiaController;
use App\Http\Controllers\ProjetoController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\RastreioController;
use App\Http\Controllers\ReacaoNoticiaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\VagaController;
use App\Http\Controllers\VerificacaoInstituicaoController;
use Illuminate\Support\Facades\Route;

/* =========================================
   PÚBLICAS
========================================= */

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/usuario', [UsuarioController::class, 'store'])->middleware('throttle:cadastro');

// Conteúdo de vitrine pode ser lido sem login.
Route::apiResource('vaga', VagaController::class)->only(['index', 'show']);
Route::apiResource('noticia', NoticiaController::class)->only(['index', 'show'])->parameters(['noticia' => 'noticia']);
Route::get('/noticia/{noticia}/reacoes', [ReacaoNoticiaController::class, 'index']);
Route::apiResource('projeto', ProjetoController::class)->only(['index', 'show']);

// Anexos: o link temporário respeita a visibilidade do registro dono; o arquivo só sai com assinatura válida.
Route::get('/anexo/{anexo}/link', [AnexoController::class, 'link'])->middleware('throttle:60,1');
Route::get('/anexo/{anexo}/arquivo', [AnexoController::class, 'arquivo'])->middleware('signed')->name('anexo.arquivo');

// Rastreabilidade: página aberta pelo QR Code do lote de filamento.
Route::get('/ranking', RankingController::class);
Route::get('/rastreio/{lote:codigo}', RastreioController::class)->middleware('throttle:60,1');

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

    // Vagas: só quem contrata (CNPJ/instituição) publica; só pessoa física se candidata.
    // Os triggers do banco repetem essas duas regras como última barreira.
    Route::middleware('perfil:contratante')->group(function () {
        Route::get('/vaga/minhas', [VagaController::class, 'minhas']);
        Route::get('/vaga/{vaga}/candidaturas', [CandidaturaController::class, 'porVaga']);
        Route::apiResource('vaga', VagaController::class)->except(['index', 'show']);
        Route::match(['put', 'patch'], '/candidatura/{candidatura}', [CandidaturaController::class, 'update']);
    });
    Route::middleware('perfil:candidato')->group(function () {
        Route::get('/candidatura', [CandidaturaController::class, 'index']);
        Route::post('/candidatura', [CandidaturaController::class, 'store']);
        Route::delete('/candidatura/{candidatura}', [CandidaturaController::class, 'destroy']);
    });
    // Notícias: publicam pessoas jurídicas e moderadores; tudo passa por moderação.
    Route::get('/noticia/minhas', [NoticiaController::class, 'minhas']);
    Route::post('/noticia', [NoticiaController::class, 'store'])->middleware('perfil:publicador');
    Route::match(['put', 'patch'], '/noticia/{noticia}', [NoticiaController::class, 'update']);
    Route::delete('/noticia/{noticia}', [NoticiaController::class, 'destroy']);
    Route::put('/noticia/{noticia}/reacao', [ReacaoNoticiaController::class, 'salvar']);
    Route::delete('/noticia/{noticia}/reacao', [ReacaoNoticiaController::class, 'destroy']);

    // Projetos: qualquer usuário submete ao repositório; só aparecem após aprovação.
    Route::get('/projeto/minhas', [ProjetoController::class, 'minhas']);
    Route::post('/projeto', [ProjetoController::class, 'store']);
    Route::match(['put', 'patch'], '/projeto/{projeto}', [ProjetoController::class, 'update']);
    Route::delete('/projeto/{projeto}', [ProjetoController::class, 'destroy']);
    Route::post('/projeto/{projeto}/anexos', [ProjetoController::class, 'enviarAnexo'])->middleware('throttle:uploads');
    Route::delete('/anexo/{anexo}', [AnexoController::class, 'destroy']);

    Route::post('/denuncia', [DenunciaController::class, 'store']);

    Route::middleware('perfil:moderador')->group(function () {
        Route::post('/noticia/{noticia}/moderacao', [NoticiaController::class, 'moderar']);
        Route::post('/projeto/{projeto}/moderacao', [ProjetoController::class, 'moderar']);
        Route::get('/denuncia', [DenunciaController::class, 'index']);
        Route::post('/denuncia/{denuncia}/resolver', [DenunciaController::class, 'resolver']);

        // Conferência de empresas, escolas e laboratórios.
        Route::get('/moderacao/instituicoes', [VerificacaoInstituicaoController::class, 'index']);
        Route::get('/moderacao/instituicoes/{usuario}/cnpj', [VerificacaoInstituicaoController::class, 'consultarCnpj']);
        Route::post('/moderacao/instituicoes/{usuario}/verificacao', [VerificacaoInstituicaoController::class, 'decidir']);
    });
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
