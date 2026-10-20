<?php

namespace Database\Seeders;

use App\Enums\AcaoPontuavel;
use App\Enums\StatusChamado;
use App\Models\Candidatura;
use App\Models\Chamado;
use App\Models\Curriculo;
use App\Models\Doacao;
use App\Models\LaudoQualidade;
use App\Models\LoteFilamento;
use App\Models\Noticia;
use App\Models\Polimero;
use App\Models\Projeto;
use App\Models\SolicitacaoColeta;
use App\Models\Usuario;
use App\Models\Vaga;
use App\Services\GamificacaoService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Dados de demonstração para a apresentação da plataforma. Senha de todos: Senha@123
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $estudante = Usuario::factory()->create([
            'nome' => 'Ana Beatriz Moreira', 'email' => 'estudante@ecohub3d.test', 'profissao' => 'Estudante de Engenharia de Materiais',
        ]);
        $maker = Usuario::factory()->prestador()->create([
            'nome' => 'Rafael Kowalski', 'email' => 'maker@ecohub3d.test', 'profissao' => 'Maker e técnico em impressão 3D',
        ]);
        $empresa = Usuario::factory()->empresa()->create(['nome' => 'Campos Gerais Manufatura Aditiva', 'email' => 'empresa@ecohub3d.test']);
        $escola = Usuario::factory()->escola()->create(['nome' => 'Colégio Estadual Professor Becker', 'email' => 'escola@ecohub3d.test']);
        $laboratorio = Usuario::factory()->laboratorio()->create(['nome' => 'Laboratório de Polímeros da UEPG', 'email' => 'laboratorio@ecohub3d.test']);
        $moderador = Usuario::factory()->moderador()->create(['nome' => 'Equipe de Curadoria EcoHub', 'email' => 'moderador@ecohub3d.test']);
        Usuario::factory()->empresa()->pendente()->create(['nome' => 'Filamentos Verdes Ltda.', 'email' => 'pendente@ecohub3d.test']);

        $this->vagas($empresa, $laboratorio, $estudante);
        $this->noticias($laboratorio, $empresa, $moderador);
        $this->projetos($estudante, $maker);
        $this->chamados($escola, $empresa, $maker);
        $this->economiaCircular($maker, $estudante, $laboratorio);

        Curriculo::factory()->for($estudante, 'usuario')->create([
            'cargo' => 'Estagiária em manufatura aditiva',
            'habilidades' => 'Fusion 360, Cura, PrusaSlicer, ensaios mecânicos',
            'competencias' => 'Trabalho em equipe, documentação técnica',
            'texto' => 'Estudante de Engenharia de Materiais com experiência em impressão FDM e caracterização de filamentos reciclados.',
        ]);
    }

    private function vagas(Usuario $empresa, Usuario $laboratorio, Usuario $candidata): void
    {
        $vagas = collect([
            [$empresa, 'Técnico(a) em impressão 3D FDM', 'Manutenção', 'Operação e manutenção de um parque de 12 impressoras FDM, calibração e controle de qualidade das peças.'],
            [$empresa, 'Designer de produto para manufatura aditiva', 'Modelagem 3D', 'Modelagem paramétrica e otimização topológica de peças funcionais para clientes do agronegócio.'],
            [$empresa, 'Analista de pós-processamento', 'Pós-processamento', 'Acabamento, lixamento, pintura e montagem de protótipos.'],
            [$laboratorio, 'Bolsista de iniciação científica — reciclagem de PETG', 'Reciclagem', 'Apoio à extrusão de filamento reciclado e aos ensaios de tração do laboratório.'],
            [$laboratorio, 'Monitor(a) de oficinas em escolas públicas', 'Educação', 'Condução de oficinas de impressão 3D para estudantes do ensino médio.'],
        ])->map(fn ($v) => Vaga::factory()->for($v[0], 'usuario')->create(['titulo' => $v[1], 'tema' => $v[2], 'texto' => $v[3], 'cidade' => 'Ponta Grossa']));

        Candidatura::factory()->for($candidata, 'usuario')->for($vagas[3], 'vaga')->create();
    }

    private function noticias(Usuario $laboratorio, Usuario $empresa, Usuario $moderador): void
    {
        $noticias = [
            [$laboratorio, 'Filamento reciclado de PETG atinge 92% da resistência do material virgem', 'Pesquisa', 'Ensaios de tração realizados no laboratório mostram que o filamento produzido a partir de carretéis e peças descartadas mantém desempenho próximo ao do material novo, abrindo caminho para peças funcionais.'],
            [$moderador, 'Como separar seus resíduos de impressão 3D para reciclagem', 'Reciclagem', 'Separe os resíduos por polímero (PLA, PETG, ABS), retire suportes metálicos e etiquetas e informe a cor predominante. Material misturado dificulta a extrusão do novo filamento.'],
            [$empresa, 'Manufatura aditiva cresce no agronegócio dos Campos Gerais', 'Mercado', 'Peças de reposição impressas sob demanda reduzem o tempo de máquina parada em propriedades rurais da região.'],
            [$laboratorio, 'Oficinas de modelagem 3D chegam a cinco escolas estaduais', 'Educação', 'Voluntários da rede EcoHub atenderam mais de 150 estudantes no último semestre, com foco em modelagem e prototipagem.'],
            [$moderador, 'Nova política de curadoria do repositório de projetos', 'Plataforma', 'Projetos enviados passam por revisão de segurança e de licença antes de ficarem públicos. Peças com risco de uso indevido são bloqueadas.'],
        ];

        foreach ($noticias as $i => [$autor, $titulo, $tema, $texto]) {
            Noticia::factory()->for($autor, 'usuario')->create([
                'titulo' => $titulo, 'tema' => $tema, 'texto' => $texto, 'data_publicacao' => now()->subDays($i * 3),
            ]);
        }
    }

    private function projetos(Usuario $estudante, Usuario $maker): void
    {
        $projetos = [
            [$maker, 'Órtese de punho ajustável', 'saude', 'cc-by-sa', 'Órtese impressa em PETG com fechos ajustáveis, desenvolvida com fisioterapeutas para reabilitação de fraturas.'],
            [$estudante, 'Kit de geometria espacial para o ensino médio', 'educacao', 'cc-by', 'Sólidos geométricos encaixáveis para aulas de matemática, com roteiro de atividades para professores.'],
            [$maker, 'Suporte de bico para pulverizador agrícola', 'agro', 'cc-by-nc', 'Peça de reposição em ABS para pulverizadores costais, com instruções de impressão a 100% de preenchimento.'],
            [$estudante, 'Engrossador de talheres para pessoas com mobilidade reduzida', 'acessibilidade', 'cc0', 'Adaptador universal em TPU que aumenta a pega de talheres e escovas de dente.'],
            [$maker, 'Mapa tátil do campus para pessoas com deficiência visual', 'acessibilidade', 'cc-by', 'Maquete em relevo com legendas em braille, impressa em PLA reciclado.'],
        ];

        foreach ($projetos as $i => [$autor, $titulo, $area, $licenca, $texto]) {
            Projeto::factory()->for($autor, 'usuario')->create([
                'titulo' => $titulo, 'area' => $area, 'licenca' => $licenca, 'texto' => $texto,
                'tema' => null, 'empresa' => null, 'data_publicacao' => now()->subDays($i * 4),
            ]);
        }

        Projeto::factory()->emRevisao()->for($estudante, 'usuario')->create([
            'titulo' => 'Protetor facial reutilizável', 'area' => 'saude', 'licenca' => 'cc-by', 'texto' => 'Aguardando revisão da curadoria.',
        ]);
    }

    private function chamados(Usuario $escola, Usuario $empresa, Usuario $maker): void
    {
        $chamados = [
            [$escola, 'Oficina de introdução à impressão 3D para o 9º ano', 'treinamento_impressao', 'Turma de 32 estudantes; a escola tem um laboratório de informática com 20 computadores.'],
            [$escola, 'Modelagem de peças para a feira de ciências', 'modelagem', 'Apoio a seis grupos de estudantes na modelagem de protótipos para a feira de ciências de novembro.'],
            [$escola, 'Digitalização de fósseis do acervo de biologia', 'scanner_3d', 'Gostaríamos de digitalizar 15 peças do acervo para criar réplicas para as aulas.'],
            [$empresa, 'Manutenção de impressora doada para a escola parceira', 'manutencao', 'Impressora Ender 3 com problema de extrusão; precisamos de diagnóstico e reparo.'],
        ];

        foreach ($chamados as [$solicitante, $titulo, $tipo, $descricao]) {
            Chamado::factory()->for($solicitante, 'usuario')->create([
                'titulo' => $titulo, 'tipo_servico' => $tipo, 'descricao' => $descricao, 'status' => StatusChamado::Aberto,
            ]);
        }

        Chamado::factory()->for($escola, 'usuario')->emAtendimento($maker)->create([
            'titulo' => 'Impressão de peças para o kit de robótica', 'tipo_servico' => 'impressao_peca',
            'descricao' => 'Chassis e suportes de sensores para 8 kits de robótica educacional.',
        ]);
    }

    /**
     * Doações -> coleta concluída -> lote com eventos e laudo: alimenta o mural e a página de rastreio.
     */
    private function economiaCircular(Usuario $maker, Usuario $estudante, Usuario $laboratorio): void
    {
        $pla = Polimero::where('sigla', 'PLA')->value('id');
        $petg = Polimero::where('sigla', 'PETG')->value('id');

        $disponiveis = [
            [$maker, $petg, 'carretel_usado', 'Carretéis vazios e sobras de PETG transparente', 800],
            [$estudante, $pla, 'peca_excedente', 'Peças com falha de impressão em PLA preto', 650],
            [$maker, $pla, 'resto_filamento', 'Pontas de filamento PLA de várias cores', 1500],
        ];
        foreach ($disponiveis as [$doador, $polimero, $tipo, $titulo, $peso]) {
            Doacao::factory()->for($doador, 'doador')->create([
                'id_polimero' => $polimero, 'tipo' => $tipo, 'titulo' => $titulo, 'peso_estimado_g' => $peso,
            ]);
        }

        $doacao = Doacao::factory()->for($maker, 'doador')->create([
            'id_polimero' => $pla, 'tipo' => 'resto_filamento', 'titulo' => 'Sobras de PLA branco do makerspace', 'peso_estimado_g' => 2400, 'status' => 'coletada',
        ]);
        $coleta = SolicitacaoColeta::factory()->concluida()->create([
            'id_doacao' => $doacao->id, 'id_laboratorio' => $laboratorio->id, 'peso_recebido_g' => 2300, 'concluida_em' => now()->subDays(20),
        ]);

        $lote = LoteFilamento::factory()->create([
            'codigo' => '01JECHB3DDEMNTE00000000001',
            'id_laboratorio' => $laboratorio->id, 'id_polimero' => $pla, 'peso_entrada_g' => 2000, 'peso_saida_g' => 1820,
            'cor' => 'natural', 'status' => 'aprovado', 'produzido_em' => now()->subDays(6),
        ]);
        $lote->coletas()->attach($coleta->id, ['peso_g' => 2000]);
        $lote->eventos()->createMany([
            ['tipo' => 'coletado', 'descricao' => 'Lote formado a partir de 1 coleta.', 'ocorrido_em' => now()->subDays(18)],
            ['tipo' => 'triturado', 'descricao' => 'Material triturado e seco a 50 °C por 6 h.', 'ocorrido_em' => now()->subDays(12)],
            ['tipo' => 'extrudado', 'descricao' => 'Extrusão em 1,75 mm a 195 °C.', 'ocorrido_em' => now()->subDays(6)],
            ['tipo' => 'laudo_emitido', 'descricao' => 'Laudo de qualidade: aprovado.', 'ocorrido_em' => now()->subDays(3)],
        ]);
        LaudoQualidade::factory()->for($lote, 'lote')->create(['id_laboratorio' => $laboratorio->id, 'emitido_em' => now()->subDays(3)]);

        $gamificacao = app(GamificacaoService::class);
        $gamificacao->conceder($laboratorio, AcaoPontuavel::ColetaConcluida, $coleta);
        $gamificacao->conceder($maker, AcaoPontuavel::DoacaoEntregue, $coleta);
    }
}
