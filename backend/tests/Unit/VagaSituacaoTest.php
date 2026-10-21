<?php

use App\Enums\StatusVaga;
use App\Models\Vaga;
use Illuminate\Support\Carbon;
use Tests\TestCase;

// O cast de data precisa da aplicação (formato de data da conexão), sem banco.
uses(TestCase::class);

afterEach(fn () => Carbon::setTestNow());

it('calcula a situação efetiva da vaga pela data de encerramento', function (string $status, ?string $encerraEm, StatusVaga $esperado) {
    Carbon::setTestNow('2026-10-21 15:00:00');
    $vaga = new Vaga(['encerra_em' => $encerraEm]);
    $vaga->status = $status;

    expect($vaga->situacao())->toBe($esperado)
        ->and($vaga->estaAberta())->toBe($esperado === StatusVaga::Aberta);
})->with([
    'aberta sem data' => ['aberta', null, StatusVaga::Aberta],
    'aberta que encerra hoje' => ['aberta', '2026-10-21', StatusVaga::Aberta],
    'aberta que encerra amanhã' => ['aberta', '2026-10-22', StatusVaga::Aberta],
    'aberta com prazo vencido' => ['aberta', '2026-10-20', StatusVaga::Encerrada],
    'encerrada pelo contratante' => ['encerrada', '2026-12-31', StatusVaga::Encerrada],
]);
