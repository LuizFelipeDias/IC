<?php

namespace App\Providers;

use App\Contracts\AntivirusScanner;
use App\Contracts\ConsultaCnpj;
use App\Models\Chamado;
use App\Models\Doacao;
use App\Models\LaudoQualidade;
use App\Models\Noticia;
use App\Models\Projeto;
use App\Models\SolicitacaoColeta;
use App\Services\Anexos\ClamAvScanner;
use App\Services\Anexos\SemAntivirus;
use App\Services\BrasilApiConsultaCnpj;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ConsultaCnpj::class, BrasilApiConsultaCnpj::class);

        $this->app->bind(AntivirusScanner::class, fn () => config('services.antivirus.driver') === 'clamav'
            ? new ClamAvScanner(config('services.antivirus.host'), config('services.antivirus.port'))
            : new SemAntivirus);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Em desenvolvimento, falha alto em N+1, atributos inexistentes e mass assignment ignorado.
        Model::shouldBeStrict(! $this->app->isProduction());

        // Nomes curtos nas colunas polimórficas (moderacoes, denuncias) em vez do nome da classe.
        Relation::morphMap([
            'chamado' => Chamado::class,
            'doacao' => Doacao::class,
            'laudo' => LaudoQualidade::class,
            'coleta' => SolicitacaoColeta::class,
            'noticia' => Noticia::class,
            'projeto' => Projeto::class,
        ]);

        // Recurso único sai sem o envelope {"data": ...}; listas paginadas mantêm data/links/meta.
        JsonResource::withoutWrapping();

        // Parâmetros de rota numéricos: "/vaga/minhas" nunca é confundido com "/vaga/{vaga}".
        Route::pattern('usuario', '[0-9]+');
        Route::pattern('vaga', '[0-9]+');
        Route::pattern('candidatura', '[0-9]+');
        Route::pattern('noticia', '[0-9]+');
        Route::pattern('projeto', '[0-9]+');
        Route::pattern('chamado', '[0-9]+');
        Route::pattern('curriculo', '[0-9]+');
        Route::pattern('denuncia', '[0-9]+');
        Route::pattern('anexo', '[0-9]+');
        Route::pattern('doacao', '[0-9]+');
        Route::pattern('coleta', '[0-9]+');
        Route::pattern('lote', '[0-9]+');

        RateLimiter::for('login', fn (Request $request) => [
            Limit::perMinute(5)->by(mb_strtolower((string) $request->input('email')).'|'.$request->ip()),
            Limit::perMinute(20)->by($request->ip()),
        ]);

        RateLimiter::for('uploads', fn (Request $request) => Limit::perMinute(30)->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('cadastro', fn (Request $request) => Limit::perMinute(6)->by($request->ip()));
    }
}
