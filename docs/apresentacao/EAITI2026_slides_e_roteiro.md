# EcoHub 3D — Slides e roteiro para o 16º EAITI (2026)

Material para montar a apresentação no Figma a partir do template oficial `Template_Slides_EAITI2026.pptx` e para ensaiar a fala.

- **Duração-alvo:** 10 min de fala (12 slides). Há uma nota no fim sobre como ajustar para 8 ou 15 min.
- **Fontes do conteúdo:** `README.md`, `SCREENS.md`, `docs/DIAGNOSTICO_E_ROADMAP.md`, `docs/diagramas/` e o código em `backend/` e `frontend/`.
- **Legenda de cada slide:**
  - 🟦 **TEXTO DO SLIDE**: o que vai escrito, exatamente.
  - 🟨 **FIGMA**: layout do template, posição, imagem e observações visuais.
  - 🟩 **FALA**: roteiro cronometrado.

---

## 0. Regras do template (medidas lidas do .pptx)

Slide 16:9, 960 × 540 px no Figma (o .pptx tem 10 × 5,63 pol). O template tem **quatro layouts**, e todos os slides abaixo usam um deles sem alterações:

| Código | Layout do template | Caixas (x, y, largura × altura em px no frame 960 × 540) | Limites práticos |
| :-: | :--- | :--- | :--- |
| **L1** | **Capa**: fundo em degradê, logos de apoio no canto inferior direito | Título: 42, 184, 860 × 108 · Nome: 47, 300, 860 × 108 | Título **em até 2 linhas** (cerca de 38 caracteres por linha), *Momo Trust Sans* ~32 pt branco. Nome em *Momo Trust Sans Light* itálico ~23 pt. |
| **L2** | **Texto + tópicos + imagem**: texto à esquerda, bloco de imagem à direita | Título: 39, 34, 690 × 60 · Texto: 40, 126, 374 × 136 · Tópicos: 40, 204, 366 × 131 · Imagem: 424, 107, 481 × 370 | Título em **1 linha** (até ~30 caracteres). Texto com 1 frase (até ~80 caracteres). **3 tópicos** de até ~35 caracteres cada (cabem 4 se forem curtos). |
| **L3** | **Texto corrido**: título e parágrafo | Título: 39, 34, 690 × 60 · Texto: 40, 126, 656 × 170 | Título em 1 linha. Parágrafo de **até 6 linhas** (~420 caracteres) em ~15,6 pt. A metade inferior direita é decorativa: não pôr nada ali. |
| **L4** | **Imagem cheia**: moldura branca sobre o degradê | Imagem: 19, 58, 923 × 463 | Sem título no template: o título vai **dentro da própria figura**, no topo, para não sair do layout. |

Regras gerais para todos os slides:
- Não mover os elementos decorativos (selo do 16º EAITI no canto superior direito e as ondas coloridas).
- Fonte do título e do corpo: *Momo Trust Sans* (a mesma do template). Cor do texto: preto `#000000` em L2/L3 e branco na capa.
- Nas figuras feitas por você (diagramas), use as cores do próprio degradê do template, para manter a identidade: azul `#3B6FD8`, verde-água `#3FB6A8`, verde `#8BC34A`, roxo `#9C4FA0` e amarelo `#F2C230` (tons aproximados, use o conta-gotas no fundo da capa). Contornos de 1,5 px em cinza escuro `#15161A`, como no template.
- Imagens no bloco de L2: **481 × 370 px**, cantos retos e contorno de 1 px, como o retângulo cinza do template.

---

## Visão geral

| # | Layout | Título | Tempo | Acumulado |
| :-: | :-: | :--- | :-: | :-: |
| 1 | L1 | EcoHub 3D (capa) | 0:20 | 0:20 |
| 2 | L2 | O problema | 1:10 | 1:30 |
| 3 | L3 | A lacuna | 0:40 | 2:10 |
| 4 | L2 | Objetivos | 0:40 | 2:50 |
| 5 | L4 | Manufatura aditiva + economia circular | 1:15 | 4:05 |
| 6 | L2 | Metodologia | 0:45 | 4:50 |
| 7 | L4 | Arquitetura da plataforma | 1:10 | 6:00 |
| 8 | L2 | Quem pode fazer o quê | 0:45 | 6:45 |
| 9 | L2 | Rastreabilidade por QR Code | 0:55 | 7:40 |
| 10 | L2 | Resultados | 1:00 | 8:40 |
| 11 | L3 | Conclusão e próximos passos | 0:50 | 9:30 |
| 12 | L1 | Obrigado | 0:15 | 9:45 |

Sobram cerca de 15 s de folga para respirar e trocar de slide.

---

## Slide 1 — Capa · L1 · 0:20

🟦 **TEXTO DO SLIDE**

- Título (2 linhas):
  > EcoHub 3D: plataforma digital para a
  > economia circular da impressão 3D
- Nome:
  > Luiz Felipe Dias de Araujo

🟨 **FIGMA**
- Use a capa do template sem mudar nada além dos dois textos.
- Quebre a linha manualmente depois de "para a", para o título ficar com duas linhas equilibradas.
- O template reserva a capa só para o nome do discente. Os orientadores e o programa ficam no slide 12, para não quebrar a regra.

🟩 **FALA (0:20)**
> "Boa tarde a todos. Meu nome é Luiz Felipe, sou aluno de Engenharia de Computação da UEPG e bolsista PIBITI. Vou apresentar o EcoHub 3D, uma plataforma digital que organiza a economia circular da impressão 3D. O trabalho é orientado pelo professor Benjamim de Melo Carvalho e coorientado pelo professor Maurício Zadra Pacheco."

---

## Slide 2 — O problema · L2 · 1:10

🟦 **TEXTO DO SLIDE**

- Título:
  > O problema
- Texto:
  > A impressão 3D se espalhou, mas o resíduo não volta para a cadeia.
- Tópicos:
  > - Peças com falha, suportes e sobras;
  > - Laboratórios que sabem reciclar polímero;
  > - Escolas sem acesso à fabricação digital.

🟨 **FIGMA**
- Bloco de imagem (481 × 370): ilustração em três colunas, com um ícone em cada uma, ligadas por setas tracejadas **interrompidas** no meio (mostrando que os atores não se conectam):
  1. **Maker**: carretel + peça quebrada (ícone `printer` ou `package` do Lucide, o mesmo pacote de ícones do frontend).
  2. **Laboratório**: ícone `flask-conical`.
  3. **Escola pública**: ícone `school`.
- Legenda pequena (12 pt, cinza `#666666`) sob cada ícone: "tem resíduo", "sabe reciclar", "precisa de formação".
- Alternativa mais simples: uma foto real de sobras de impressão do laboratório da UEPG (se tiverem), recortada em 481 × 370.

🟩 **FALA (1:10)**
> "A impressão 3D deixou de ser coisa de nicho. Hoje ela está nas universidades, nas escolas e na casa de muitos *makers*. Só que ela gera resíduo: peça que falhou, suporte que é arrancado e jogado fora, carretel vazio, sobra de filamento. Na maioria das vezes, esse plástico vai para o lixo.
>
> Ao mesmo tempo, temos do outro lado grupos de pesquisa em polímeros, como o laboratório ao qual este projeto está vinculado, que têm o conhecimento e o equipamento para reprocessar esse material e transformá-lo em filamento de novo.
>
> E existe um terceiro ator: as escolas públicas, que têm demanda por formação em fabricação digital, por modelagem, por uma impressão pontual, mas não sabem a quem recorrer.
>
> Ou seja: quem tem o resíduo, quem sabe reciclar e quem precisa do serviço existem, mas não estão conectados. Esse é o problema que o EcoHub 3D ataca."

---

## Slide 3 — A lacuna · L3 · 0:40

🟦 **TEXTO DO SLIDE**

- Título:
  > A lacuna
- Texto (parágrafo único, ~390 caracteres):
  > As soluções existentes atendem demandas isoladas: serviços de impressão, repositórios de modelos, redes sociais ou cursos. Nenhuma das analisadas reúne esses atores num único ambiente nem registra a origem do material reciclado. Sem essa rastreabilidade, o filamento reciclado não tem credibilidade técnica, e o impacto socioambiental não pode ser medido.

🟨 **FIGMA**
- Layout de texto corrido, sem imagem.
- Opcional: destacar em **negrito** "Nenhuma das analisadas reúne esses atores" e "rastreabilidade". Não use mais de dois destaques.
- Conferir que o texto não passa de 6 linhas e não invade a onda decorativa.

🟩 **FALA (0:40)**
> "Quando olhamos o que já existe, encontramos soluções boas, mas isoladas: serviços que vendem impressão, sites de modelos 3D, grupos em redes sociais, cursos. Nenhuma das que analisamos junta esses atores num lugar só. E, principalmente, nenhuma registra de onde veio o material reciclado. Isso é importante porque, sem saber a origem e sem um laudo de qualidade, ninguém confia num filamento reciclado, e também não se consegue medir o impacto ambiental do que foi feito."

---

## Slide 4 — Objetivos · L2 · 0:40

🟦 **TEXTO DO SLIDE**

- Título:
  > Objetivos
- Texto:
  > Conectar o ecossistema da impressão 3D e fechar o ciclo do material.
- Tópicos:
  > - Doação, coleta e reciclagem de resíduos;
  > - Rastrear cada lote por QR Code;
  > - Atender pedidos de escolas públicas.

🟨 **FIGMA**
- Bloco de imagem: captura da **tela Início** (`/home`) do protótipo, em desktop, recortada para 481 × 370 mostrando o cabeçalho e os atalhos por perfil.
- Como capturar: rodar o sistema (`README.md`, seção 10), entrar com `maker@ecohub3d.test` / `Senha@123` e fazer a captura em 1440 px de largura.
- Se a captura ficar muito poluída, reduza com zoom de 80% no navegador antes de capturar.

🟩 **FALA (0:40)**
> "O objetivo geral foi desenvolver uma plataforma que conecte esses atores e organize o ciclo de vida do material segundo a economia circular.
>
> Os objetivos específicos principais estão no slide: permitir que *makers* doem resíduos e que laboratórios os coletem; rastrear cada lote de filamento reciclado, da doação até o laudo, por um QR Code; e viabilizar pedidos de escolas públicas atendidos por laboratórios e voluntários. Além disso, a plataforma tem banco de vagas e currículos, repositório de projetos 3D e um sistema de pontos e selos para estimular a participação."

---

## Slide 5 — Manufatura aditiva + economia circular · L4 · 1:15

🟦 **TEXTO DO SLIDE** (dentro da figura)

- Título da figura (topo, à esquerda, 28 pt, negrito):
  > Do resíduo à nova peça
- Os seis passos do ciclo, em círculo, no sentido horário:
  > 1. **Doação** — maker cadastra polímero, peso e fotos
  > 2. **Coleta** — laboratório verificado solicita e conclui com o peso real
  > 3. **Lote** — coletas do mesmo polímero viram um lote
  > 4. **Reciclagem** — triturado, extrudado (linha do tempo)
  > 5. **Laudo** — diâmetro, tolerância, ovalidade, tração → aprovado ou reprovado
  > 6. **QR Code** — origem e laudo públicos, sem dados pessoais
- Texto no centro do círculo:
  > novo filamento → nova peça

🟨 **FIGMA**
- Frame de 923 × 463 com fundo branco, encaixado na moldura do layout L4.
- Diagrama circular: seis nós (círculos de 110 px) ligados por setas curvas. Uma cor do degradê por nó, na ordem azul → verde-água → verde → amarelo → roxo → azul escuro, para o ciclo "girar" no degradê do próprio template.
- Dentro de cada nó: ícone Lucide (`gift`, `truck`, `layers`, `recycle`, `file-check`, `qr-code`) e o nome do passo. A descrição curta fica fora do círculo, em 12 pt.
- Seta de retorno, do QR Code de volta à Doação, com o rótulo "a peça, no fim da vida, volta como resíduo".
- Base visual pronta: o diagrama de sequência da seção 6.1 do `README.md` e o fluxo "resíduo → filamento" do `docs/diagramas/mapa-de-telas.png`.

🟩 **FALA (1:15)**
> "Este é o coração do projeto: a ligação entre manufatura aditiva e economia circular.
>
> A economia circular propõe que o material não termine como lixo, mas volte para a produção. A impressão 3D é um caso perfeito para isso, porque o resíduo é quase sempre um termoplástico, como PLA, PETG ou ABS, que pode ser triturado e extrudado de novo em filamento.
>
> Na plataforma, o ciclo funciona assim: o *maker* cadastra uma doação, informando o polímero, o peso e fotos. Um laboratório verificado solicita a coleta; o doador aceita, e, quando a coleta é concluída, o laboratório registra o peso real. As coletas do mesmo polímero são agrupadas num lote. O laboratório registra cada etapa, como triturado e extrudado, e emite um laudo com diâmetro, tolerância, ovalidade e resistência à tração. O laudo aprova ou reprova o lote.
>
> Por fim, cada lote ganha um código único, impresso como QR Code no carretel. Quem recebe esse filamento consegue ver de onde ele veio e como foi testado. E a peça impressa com ele, quando chegar ao fim da vida, pode voltar como doação, fechando o ciclo."

---

## Slide 6 — Metodologia · L2 · 0:45

🟦 **TEXTO DO SLIDE**

- Título:
  > Metodologia
- Texto:
  > Desenvolvimento incremental, guiado por requisitos e por testes.
- Tópicos:
  > - Requisitos: 6 módulos com os orientadores;
  > - Modelagem UML e do banco no Figma;
  > - Entregas por módulo, com testes e CI.

🟨 **FIGMA**
- Bloco de imagem: `docs/diagramas/casos-de-uso.png` recortado para 481 × 370 (mostrando os atores e os casos de uso principais). Se ficar ilegível, use em vez dele o `docs/diagramas/banco-de-dados.png` com zoom no módulo de economia circular (tabelas `doacoes`, `solicitacoes_coleta`, `lotes_filamento`, `laudos_qualidade`).
- Como os diagramas já foram feitos no arquivo do Figma "EcoHub 3D — Diagramas UML e Banco de Dados", copie o frame direto de lá, em vez de importar o PNG, para manter a nitidez.

🟩 **FALA (0:45)**
> "A metodologia foi incremental. Começamos com o levantamento de requisitos junto aos orientadores, que resultou em seis módulos. Depois fizemos a modelagem no Figma: casos de uso, diagrama de classes, modelo de dados e o mapa de telas, que vocês veem aqui.
>
> A partir disso, cada módulo foi desenvolvido de ponta a ponta, do banco à tela, com testes automatizados para cada regra de permissão e cada fluxo. Esses testes rodam a cada mudança num pipeline de integração contínua no GitHub. As tarefas foram acompanhadas num Kanban no Notion."

---

## Slide 7 — Arquitetura da plataforma · L4 · 1:10

🟦 **TEXTO DO SLIDE** (dentro da figura)

- Título da figura:
  > Arquitetura em cinco camadas
- Cinco caixas, da esquerda para a direita, ligadas por setas grossas:
  > **1 · Cliente** — SPA em React 19 · QR Code no carretel
  > **2 · Borda HTTP** — 88 rotas · token Sanctum · limite de tentativas · perfil
  > **3 · Aplicação** — controllers, validação e policies
  > **4 · Domínio** — modelos, perfis de acesso, gamificação, fila de antivírus
  > **5 · Infraestrutura** — PostgreSQL 16 · arquivos privados · BrasilAPI (CNPJ)
- Rótulo da primeira seta: `HTTPS + token`

🟨 **FIGMA**
- Frame de 923 × 463, fundo branco. Cinco caixas de 160 × 230 px, cantos de 8 px, contorno 1,5 px `#15161A`, como no diagrama da seção 5 do `README.md`.
- Faixa colorida de 8 px no topo de cada caixa, uma cor do degradê por camada.
- A caixa 5 em formato de cilindro (banco de dados).
- Logos pequenos (24 px) dentro das caixas: React (1), Laravel (2 e 3), PostgreSQL (5). Use as versões monocromáticas para não competir com o degradê.
- Abaixo das caixas, uma linha de texto de 12 pt: "Cada camada só conversa com a seguinte."

🟩 **FALA (1:10)**
> "Agora a arquitetura. O sistema é dividido em cinco camadas, e cada uma só conversa com a seguinte.
>
> Na ponta está o cliente: uma aplicação web em React, com 22 telas e um design system próprio em CSS. Ele fala com o servidor por HTTPS, sempre com um token de acesso.
>
> A segunda camada é a borda da API, feita em Laravel. São 88 rotas, e é aqui que barramos quem não está logado, quem passou do limite de tentativas e quem não tem o perfil exigido.
>
> Na camada de aplicação ficam os controllers, a validação dos dados e as policies, que decidem, registro por registro, se aquela pessoa pode mexer naquele dado.
>
> O domínio concentra as regras do negócio: os perfis de acesso, a pontuação e a verificação de arquivos em fila, com antivírus.
>
> E a base é o PostgreSQL. Uma decisão importante foi usar o banco como fonte de verdade: as regras críticas também estão nele, como restrições e gatilhos, então, mesmo que a aplicação falhe, o banco não aceita um dado inválido."

---

## Slide 8 — Quem pode fazer o quê · L2 · 0:45

🟦 **TEXTO DO SLIDE**

- Título:
  > Quem pode fazer o quê
- Texto:
  > Sete perfis de acesso, calculados a partir do tipo de conta.
- Tópicos:
  > - Instituições só atuam após checar o CNPJ;
  > - Só laboratório verificado emite laudo;
  > - Regras na tela, na API e no banco.

🟨 **FIGMA**
- Bloco de imagem: tabela simplificada em 481 × 370, feita no Figma (não é captura), com 5 linhas e 4 colunas:

  | Ação | Maker | Escola | Laboratório |
  | :--- | :-: | :-: | :-: |
  | Doar resíduo | ✅ | ✅ | ✅ |
  | Abrir pedido | — | ✅ | — |
  | Aceitar pedido | ✅ | — | ✅ |
  | Coletar e emitir laudo | — | — | ✅ |

- Cabeçalho da tabela com fundo verde-água claro; ✅ em verde, — em cinza `#CCCCCC`.
- Fonte: tabela de permissões da seção 4 do `README.md` (método `Usuario::temPerfil()` em `backend/app/Models/Usuario.php`).

🟩 **FALA (0:45)**
> "Como a plataforma junta atores muito diferentes, o controle de acesso é central. No cadastro, a pessoa escolhe o tipo de conta: pessoa física, empresa, escola, laboratório ou estabelecimento. A partir disso, o sistema calcula sete perfis de acesso num único ponto do código.
>
> Duas regras se destacam. Primeiro, empresas, escolas e laboratórios começam pendentes, e só ganham permissões depois que um moderador confere o CNPJ na Receita. Segundo, só laboratório verificado pode coletar, criar lote e emitir laudo, o que dá credibilidade ao filamento. Essas regras são aplicadas em camadas: a tela esconde o que a pessoa não pode fazer, mas quem garante é a API e, no fim, o próprio banco."

---

## Slide 9 — Rastreabilidade por QR Code · L2 · 0:55

🟦 **TEXTO DO SLIDE**

- Título:
  > Rastreabilidade por QR Code
- Texto:
  > Uma página pública para cada lote de filamento reciclado.
- Tópicos:
  > - Origem do material e linha do tempo;
  > - Laudo de qualidade com PDF;
  > - Sem dados pessoais dos doadores.

🟨 **FIGMA**
- Bloco de imagem: composição com **duas peças sobrepostas**:
  1. Ao fundo (≈ 70% do bloco): captura da tela `/rastreio/01JECHB3DDEMNTE00000000001` (lote de demonstração, abre sem login), em celular (390 px), mostrando os contadores, a linha do tempo e as barras do laudo.
  2. À frente, no canto inferior esquerdo: o QR Code gerado pela tela de lote (`/lotes/:id`), com 120 × 120 px e uma sombra suave, simulando a etiqueta do carretel.
- Se quiser mostrar ao vivo: o QR do slide pode apontar para a página de rastreio do sistema rodando no seu notebook (só se houver rede no auditório; caso contrário, fique com a captura).

🟩 **FALA (0:55)**
> "Esta é a página de rastreio. Cada lote tem um código único, gerado no momento em que é criado, e esse código vira o QR Code impresso no carretel.
>
> Quem escaneia, sem precisar de cadastro, vê o polímero, o laboratório responsável, de quais cidades e de que tipo de doação veio o material, a linha do tempo do processamento e o laudo de qualidade, com o PDF.
>
> Um cuidado importante: a página mostra a origem de forma agregada, sem nenhum dado pessoal dos doadores. Isso foi uma decisão de projeto, pensando na proteção de dados pessoais.
>
> É essa rastreabilidade que permite dizer não só 'este filamento é reciclado', mas também 'este filamento foi testado e passou'."

---

## Slide 10 — Resultados · L2 · 1:00

🟦 **TEXTO DO SLIDE**

- Título:
  > Resultados
- Texto:
  > Protótipo funcional com 5 dos 6 módulos implementados.
- Tópicos:
  > - Ciclo completo: doação → QR Code;
  > - 88 rotas de API e 22 telas;
  > - 217 testes automatizados.

🟨 **FIGMA**
- Bloco de imagem: **painel de números** em 481 × 370, em grade 2 × 2, cada cartão com um número grande (40 pt, negrito) e uma legenda (12 pt):

  | | |
  | :-: | :-: |
  | **5 / 6** módulos | **88** rotas de API |
  | **22** telas | **217** testes (163 API + 54 interface) |

- Cada cartão com a faixa superior numa cor do degradê. Fundo branco, contorno 1 px.
- Alternativa: substituir um dos cartões por uma miniatura do `docs/diagramas/mapa-de-telas.png`.

🟩 **FALA (1:00)**
> "Como resultado, temos um protótipo funcional que implementa cinco dos seis módulos do documento de requisitos: doações, coleta e reciclagem, repositório de projetos 3D, pedidos de escolas e banco de vagas e currículos. O sexto, o hub de conexão, está planejado.
>
> O ciclo de economia circular está completo, da doação ao QR Code público. A API tem 88 rotas e o frontend tem 22 telas, testadas em computador e celular.
>
> Também trabalhamos a segurança dos arquivos: os modelos STL e 3MF e os laudos em PDF são validados pelo conteúdo, não só pela extensão, e passam por antivírus.
>
> Tudo isso é coberto por 217 testes automatizados, que rodam a cada alteração tanto em PostgreSQL quanto em SQLite. Vale dizer que ainda é um protótipo: o próximo passo é testá-lo com usuários reais."

---

## Slide 11 — Conclusão e próximos passos · L3 · 0:50

🟦 **TEXTO DO SLIDE**

- Título:
  > Conclusão e próximos passos
- Texto (~400 caracteres):
  > O EcoHub 3D mostra que uma plataforma digital pode conectar quem gera resíduo, quem recicla e quem precisa de fabricação digital, dando ao filamento reciclado origem e laudo verificáveis. Próximos passos: mapa interativo e hub de conexão, notificações e visualizador 3D, painel de impacto socioambiental e implantação com testes em escolas e laboratórios reais.

🟨 **FIGMA**
- Layout de texto corrido. Destaque em negrito apenas "origem e laudo verificáveis".
- Se preferir tópicos aqui, a segunda frase pode virar 4 tópicos curtos, mas aí use o L2 (com o mapa de telas no bloco de imagem) e mantenha o título em 1 linha.

🟩 **FALA (0:50)**
> "Para concluir: o EcoHub 3D mostra que é possível usar uma plataforma digital para conectar quem gera resíduo de impressão 3D, quem sabe reciclar e quem precisa de fabricação digital. E, com a rastreabilidade, o filamento reciclado passa a ter origem e laudo verificáveis, o que gera confiança e permite medir o impacto.
>
> Os próximos passos são: um mapa interativo e o hub de conexão, notificações e um visualizador 3D dos projetos, um painel de impacto socioambiental, que pode apoiar a busca de financiamento, e a implantação real, com testes com escolas e laboratórios."

---

## Slide 12 — Obrigado · L1 · 0:15

🟦 **TEXTO DO SLIDE**

- Título (2 linhas):
  > Obrigado!
  > github.com/LuizFelipeDias/IC
- Nome (no lugar do "Nome do discente"):
  > Luiz Felipe Dias de Araujo · Orient.: Prof. Benjamim de Melo Carvalho · Coorient.: Prof. Dr. Maurício Zadra Pacheco · PIBITI/UEPG

🟨 **FIGMA**
- Duplicar a capa (L1). O template não tem slide de encerramento, então a capa é o único layout coerente.
- A linha do nome fica longa: reduza para ~16 pt **só nesse slide** e deixe em 2 linhas, quebrando depois do nome do discente. Contato: `ecohub3d@deinfo.uepg.br`, se quiser incluir, numa terceira linha.
- Opcional: um QR Code branco (100 × 100 px) apontando para o repositório, acima dos logos de apoio, sem cobri-los.

🟩 **FALA (0:15)**
> "Agradeço aos meus orientadores, à UEPG e ao PIBITI pelo apoio. O código e a documentação estão no repositório do GitHub que aparece no slide. Obrigado pela atenção, e fico à disposição para perguntas."

---

## Perguntas prováveis da banca (respostas curtas)

| Pergunta | Resposta sugerida |
| :--- | :--- |
| "A plataforma recicla o plástico?" | Não. Ela organiza e registra o ciclo. A reciclagem física é feita pelos laboratórios parceiros; a plataforma garante a rastreabilidade e o laudo. |
| "Como garantir que o laudo é confiável?" | Só laboratório com CNPJ verificado por um moderador pode emitir laudo, e o laudo traz medidas objetivas (diâmetro, tolerância, ovalidade, tração) e o PDF original. |
| "E a LGPD?" | O rastreio mostra a origem agregada (cidade e tipo de doação), sem nome nem contato dos doadores. O contato só é liberado entre as partes depois do aceite. Fotos são reprocessadas, o que remove a localização (EXIF/GPS). A política formal de LGPD (termo de aceite, exportação e exclusão de dados) está no roteiro de próximos passos. |
| "Já foi testado com usuários?" | Ainda não, é um protótipo. Os testes foram automatizados e visuais, com perfis de demonstração. O teste com usuários reais é a próxima etapa. |
| "Por que Laravel e React?" | Laravel oferece autenticação, filas e validação prontas, e o PostgreSQL permite garantir as regras no banco. React permite uma interface rápida, que se adapta ao perfil do usuário. |
| "Como evitar que dois laboratórios aceitem o mesmo pedido?" | O aceite trava o registro no banco (`SELECT … FOR UPDATE`). Quem chega depois recebe a resposta "conflito". |

---

## Ajuste de tempo

- **8 min:** junte os slides 2 e 3 (use só o L2 do problema e diga a lacuna na fala) e corte o slide 8, levando uma frase dele para o slide 7.
- **15 min:** mantenha os 12 slides e acrescente, depois do slide 9, um slide L4 com o `docs/diagramas/mapa-de-telas.png` (1:30) e um L2 sobre segurança de uploads (1:00), além de uma demonstração rápida da página de rastreio (1:30).

## Dicas de ensaio

- Ensaie em voz alta com cronômetro. O roteiro foi escrito para cerca de 140 palavras por minuto.
- Os números (88, 22, 217, 5/6) vêm do `README.md`. Se o código mudar antes do evento, confira de novo com `php artisan route:list --path=api` e `php artisan test`.
- Leve as capturas salvas no notebook e no pendrive. Não dependa da rede do auditório.
