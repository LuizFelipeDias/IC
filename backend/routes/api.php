<?php

use App\Http\Controllers\AnexoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CandidaturaController;
use App\Http\Controllers\ChamadoController;
use App\Http\Controllers\ColetaController;
use App\Http\Controllers\CurriculoController;
use App\Http\Controllers\DenunciaController;
use App\Http\Controllers\DoacaoController;
use App\Http\Controllers\InstituicaoController;
use App\Http\Controllers\LoteController;
use App\Http\Controllers\NoticiaController;
use App\Http\Controllers\PolimeroController;
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
Route::get('/vaga/opcoes', [VagaController::class, 'opcoes']);
Route::apiResource('vaga', VagaController::class)->only(['index', 'show']);
Route::apiResource('noticia', NoticiaController::class)->only(['index', 'show'])->parameters(['noticia' => 'noticia']);
Route::get('/noticia/{noticia}/reacoes', [ReacaoNoticiaController::class, 'index']);
Route::apiResource('projeto', ProjetoController::class)->only(['index', 'show']);

// Anexos: o link temporário respeita a visibilidade do registro dono; o arquivo só sai com assinatura válida.
Route::get('/anexo/{anexo}/link', [AnexoController::class, 'link'])->middleware('throttle:60,1');
Route::get('/anexo/{anexo}/arquivo', [AnexoController::class, 'arquivo'])->middleware('signed')->name('anexo.arquivo');

// Rastreabilidade: página aberta pelo QR Code do lote de filamento.
Route::get('/ranking', RankingController::class);
Route::get('/polimeros', [PolimeroController::class, 'index']);
Route::get('/rastreio/{lote:codigo}', RastreioController::class)
    ->where('lote', '[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}')
    ->middleware('throttle:60,1');

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

    // Diretório de instituições verificadas (empresas, escolas, laboratórios, estabelecimentos).
    Route::get('/instituicoes', [InstituicaoController::class, 'index']);
    Route::get('/instituicoes/{instituicao}', [InstituicaoController::class, 'show'])->whereNumber('instituicao');

    // Vagas: só quem contrata (CNPJ/instituição) publica; só pessoa física se candidata.
    // Os triggers do banco repetem essas duas regras como última barreira.
    Route::middleware('perfil:contratante')->group(function () {
        Route::get('/vaga/minhas', [VagaController::class, 'minhas']);
        Route::get('/vaga/{vaga}/candidaturas', [CandidaturaController::class, 'porVaga']);
        Route::post('/vaga/{vaga}/encerrar', [VagaController::class, 'encerrar']);
        Route::apiResource('vaga', VagaController::class)->except(['index', 'show']);
        // Banco de currículos: só instituições verificadas que contratam (apenas os visíveis).
        Route::get('/curriculo', [CurriculoController::class, 'index']);
        Route::match(['put', 'patch'], '/candidatura/{candidatura}', [CandidaturaController::class, 'update']);
    });
    Route::middleware('perfil:candidato')->group(function () {
        Route::get('/candidatura', [CandidaturaController::class, 'index']);
        Route::post('/candidatura', [CandidaturaController::class, 'store']);
        Route::delete('/candidatura/{candidatura}', [CandidaturaController::class, 'destroy']);
        Route::post('/curriculo', [CurriculoController::class, 'store']);
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

    // Módulo 1 — Doação de makers (qualquer usuário doa).
    Route::get('/doacao', [DoacaoController::class, 'index']);
    Route::get('/doacao/minhas', [DoacaoController::class, 'minhas']);
    Route::get('/doacao/{doacao}', [DoacaoController::class, 'show']);
    Route::post('/doacao', [DoacaoController::class, 'store']);
    Route::match(['put', 'patch'], '/doacao/{doacao}', [DoacaoController::class, 'update']);
    Route::delete('/doacao/{doacao}', [DoacaoController::class, 'destroy']);
    Route::post('/doacao/{doacao}/fotos', [DoacaoController::class, 'enviarFoto'])->middleware('throttle:uploads');

    // Módulo 2 — Coletas: o laboratório solicita; doador e laboratório conduzem o fluxo.
    Route::get('/coleta', [ColetaController::class, 'index']);
    Route::get('/coleta/{coleta}', [ColetaController::class, 'show']);
    Route::post('/coleta/{coleta}/aceitar', [ColetaController::class, 'aceitar']);
    Route::post('/coleta/{coleta}/recusar', [ColetaController::class, 'recusar']);
    Route::post('/coleta/{coleta}/agendar', [ColetaController::class, 'agendar']);
    Route::post('/coleta/{coleta}/concluir', [ColetaController::class, 'concluir']);
    Route::post('/coleta/{coleta}/cancelar', [ColetaController::class, 'cancelar']);

    // Laboratórios verificados: solicitar resíduos, produzir lotes e emitir laudos.
    Route::middleware('perfil:receptor')->group(function () {
        Route::post('/doacao/{doacao}/coletas', [ColetaController::class, 'store']);
        Route::get('/lote', [LoteController::class, 'index']);
        Route::post('/lote', [LoteController::class, 'store']);
        Route::get('/lote/{lote}', [LoteController::class, 'show']);
        Route::patch('/lote/{lote}', [LoteController::class, 'update']);
        Route::post('/lote/{lote}/eventos', [LoteController::class, 'registrarEvento']);
        Route::post('/lote/{lote}/laudos', [LoteController::class, 'emitirLaudo'])->middleware('throttle:uploads');
    });

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
    // Currículo: cada pessoa vê e edita só o próprio (a Policy confere o dono).
    Route::get('/curriculo/meus', [CurriculoController::class, 'meus']);
    Route::apiResource('curriculo', CurriculoController::class)->only(['show', 'update', 'destroy']);
});
