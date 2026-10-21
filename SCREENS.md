# EcoHub 3D — Telas do frontend

Estado atual de cada tela: rota, quem acessa, de qual arquivo do Figma ela vem e o que tem de movimento. A galeria no fim reserva o lugar das capturas (desktop 1440 px e celular 390 px); os arquivos entram em `docs/screens/` com os nomes indicados.

## Índice

| # | Tela | Rota | Quem acessa | Referência no Figma | Destaques |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | [Entrar](#login) | `/` | público (logado vai para /home) | Register Page for Web | coluna de 397 px, campos com borda de 4 px, ilustrações laterais |
| 2 | [Criar conta](#cadastro) | `/cadastro/usuario` | público | Register Page for Web | 5 tipos de conta; PJ nasce pendente |
| 3 | [Rastreio do lote (QR)](#rastreio) | `/rastreio/:codigo` | público | linguagem do app | contadores, linha do tempo, barras do laudo |
| 4 | [Início](#home) | `/home` | autenticado | Modern Product Launch | carrosséis com setas, pontos, autoplay e arrastar |
| 5 | [Painel de chamados](#chamados) | `/chamados` | solicitante · prestador · moderador | Squarespace + Mockfit | KPIs com contagem, gráfico que cresce |
| 6 | [Novo chamado](#registro-chamado) | `/chamados/novo` | solicitante | Squarespace (formulário) | só Escola, Empresa e Estabelecimento verificados |
| 7 | [Doações e coletas](#doacoes) | `/doacoes` | autenticado (coleta: receptor) | Squarespace | carrossel de polímeros, visões por papel |
| 8 | [Registrar doação de peças](#registro-doacao) | `/doacoes/nova` | autenticado (maker) | Squarespace (formulário) | dropzone de fotos |
| 9 | [Lotes](#lotes) | `/lotes · /lotes/:id` | receptor | linguagem do app | linha do tempo, laudo, QR |
| 10 | [Empresas e instituições](#instituicoes) | `/instituicoes` | autenticado | Squarespace | filtro por tipo, números de participação |
| 11 | [Vagas e banco de currículos](#vagas) | `/vagas` | autenticado (candidatar: candidato) | Squarespace | detalhe, candidatos para o contratante |
| 12 | [Publicar vaga](#registro-vaga) | `/vagas/nova` | contratante | Squarespace (formulário) | só PJ verificada |
| 13 | [Meu currículo](#curriculo) | `/curriculo` | candidato | Squarespace (formulário) | especialidades, portfólio, candidaturas |
| 14 | [Portal de notícias](#noticias) | `/noticias` | autenticado | New York Times News Portal | bloco AO VIVO em carrossel |
| 15 | [Matéria](#noticia) | `/noticias/:id` | publicada; rascunho: autor e moderador | New York Times News Portal | barra de progresso de leitura |
| 16 | [Escrever notícia](#registro-noticia) | `/noticias/nova · /noticias/:id/editar` | publicador | Squarespace (formulário) | entra em revisão |
| 17 | [Vitrine de projetos](#projetos) | `/projetos` | autenticado | Personal Portfolio | cartões alternados, zoom no hover |
| 18 | [Projeto](#projeto) | `/projetos/:id` | publicado; rascunho: autor e moderador | Personal Portfolio (About) | download STL/3MF por link assinado |
| 19 | [Enviar projeto 3D](#registro-projeto) | `/projetos/novo · /projetos/:id/editar` | autenticado (autor) | Squarespace (formulário) | dropzones STL/3MF e imagens |
| 20 | [Ranking e selos](#ranking) | `/ranking` | autenticado | linguagem do app | pódio animado |
| 21 | [Minhas publicações](#publicacoes) | `/publicacoes` | autor | linguagem do app | status de revisão |
| 22 | [Moderação e verificação](#moderacao) | `/moderacao` | moderador | linguagem do app | notícias, projetos, denúncias e CNPJ |

Arquivos do Figma de referência:

- Home: [Modern Product Launch](https://www.figma.com/design/LGUJtWnvKBIbWzRrLwYUS8) (frame `1:29`)
- Login e cadastro: [Register Page for Web](https://www.figma.com/design/RkvaW8JJjgGQ1vhk6dNoNT) (frame `1:2`)
- Notícias: [New York Times News Portal](https://www.figma.com/design/pmQejtfTEUKhDgbK4PvcPI) (frame `1:131`)
- Projetos: [Personal Portfolio Website Template](https://www.figma.com/design/W9vaSi2rB9IZaf2ty9y4Bn) (frames `7:191` e `7:291`)
- Navegação e rodapé: [Footers](https://www.figma.com/design/g8QB6OEHbZd5qr9k2k0fc4) (frame `113:7361`)
- Listagens, painéis e formulários: [Website Templates — Squarespace](https://www.figma.com/design/2BKD8TGc4woMAtnmbZkz5f) (frame `19:2115`) + estrutura de painel do Mockfit

## Regras de visibilidade (RBAC)

O frontend esconde o que o perfil não pode fazer (`pode(...)` e `RequirePerfil`); a API repete a mesma regra (middleware `perfil`, Policies e banco), então esconder é só experiência de uso. Instituições (Empresa, Escola, Laboratório, Estabelecimento) só ganham perfis depois que um moderador verifica o CNPJ/INEP; enquanto isso, a tela bloqueada explica que o cadastro está em análise.

| Ação na interface | Onde aparece | Quem vê |
| :--- | :--- | :--- |
| Botão **Novo chamado** e tela `/chamados/novo` | Painel de chamados | Escola, Empresa e Estabelecimento verificados (solicitante) |
| Visão **Disponíveis**, escolha do **local de atendimento** e **Aceitar** | Painel de chamados | Maker/voluntário e Laboratório verificado (prestador) |
| **Concluir** atendimento | Detalhe do chamado | Prestador responsável |
| **Cancelar** e **Excluir** chamado | Detalhe do chamado | Solicitante dono, enquanto aberto |
| **Registrar doação** de peças e filamento | Doações (faixa preta e cabeçalho) | Todo usuário logado (makers incluídos) |
| **Solicitar coleta** e visão **Minhas coletas** | Doações | Laboratório verificado (receptor homologado) |
| **Aceitar / recusar** coleta | Pedidos nas minhas doações | Doador |
| **Publicar vaga**, ver candidatos e banco de currículos | Vagas | Empresa, Escola, Laboratório e Estabelecimento verificados (contratante) |
| **Candidatar-se** e **Meu currículo** | Vagas | Pessoa física (candidato) |
| **Escrever notícia** | Portal de notícias | Instituição verificada ou moderador (publicador); entra em revisão |
| **Enviar projeto** | Vitrine de projetos | Todo usuário logado; entra em revisão |
| Rascunho ou rejeitado de notícia/projeto | Detalhe | Autor e moderadores |
| **Moderação**, verificação de CNPJ e denúncias | Navegação | Moderador |
| **Lotes**, eventos e **laudo** | Navegação | Laboratório verificado (receptor) |
| Rastreio pelo QR Code | Página pública | Qualquer pessoa, sem login |

## Movimento e acessibilidade

- **Transição de página:** esmaecimento com leve subida a cada troca de rota (`.pagina-entra`).
- **Revelar ao rolar:** atributo `data-revelar` (de baixo, esquerda, direita, escala, fade) com atraso escalonado (`--atraso`).
- **Hovers:** cartões sobem (`.eleva`), imagens aproximam (`.zoom-imagem`), sublinhados crescem (`.sublinha`).
- **Carrosséis** (`components/Carrossel.jsx`): setas, pontos, autoplay que pausa no hover/foco, arrastar com mouse ou dedo e teclado. Na Home e no bloco AO VIVO de Notícias.
- **Contadores e gráficos:** `Contador` sobe o número ao aparecer; barras do gráfico de chamados crescem ao carregar.
- **Dropzones** (`AreaEnvio`): estado de arrastar ("Solte para enviar") e barra de progresso nos formulários de registro.
- **`prefers-reduced-motion`:** desliga animações, contadores mostram o valor final e carrosséis não avançam sozinhos.

## Galeria

Capturas a gerar com o seed de demonstração (`php artisan migrate:fresh --seed`). Nomes: `docs/screens/<tela>-desktop.png` (1440 px, página inteira) e `docs/screens/<tela>-mobile.png` (390 px).

### Entrar
<a id="login"></a>

`/` · público (logado vai para /home) · referência: Register Page for Web

| Desktop | Mobile |
| :-: | :-: |
| ![Entrar — desktop](./docs/screens/login-desktop.png) | ![Entrar — mobile](./docs/screens/login-mobile.png) |

### Criar conta
<a id="cadastro"></a>

`/cadastro/usuario` · público · referência: Register Page for Web

| Desktop | Mobile |
| :-: | :-: |
| ![Criar conta — desktop](./docs/screens/cadastro-desktop.png) | ![Criar conta — mobile](./docs/screens/cadastro-mobile.png) |

### Rastreio do lote (QR)
<a id="rastreio"></a>

`/rastreio/:codigo` · público · referência: linguagem do app

| Desktop | Mobile |
| :-: | :-: |
| ![Rastreio do lote (QR) — desktop](./docs/screens/rastreio-desktop.png) | ![Rastreio do lote (QR) — mobile](./docs/screens/rastreio-mobile.png) |

### Início
<a id="home"></a>

`/home` · autenticado · referência: Modern Product Launch

| Desktop | Mobile |
| :-: | :-: |
| ![Início — desktop](./docs/screens/home-desktop.png) | ![Início — mobile](./docs/screens/home-mobile.png) |

### Painel de chamados
<a id="chamados"></a>

`/chamados` · solicitante · prestador · moderador · referência: Squarespace + Mockfit

| Desktop | Mobile |
| :-: | :-: |
| ![Painel de chamados — desktop](./docs/screens/chamados-desktop.png) | ![Painel de chamados — mobile](./docs/screens/chamados-mobile.png) |

### Novo chamado
<a id="registro-chamado"></a>

`/chamados/novo` · solicitante · referência: Squarespace (formulário)

| Desktop | Mobile |
| :-: | :-: |
| ![Novo chamado — desktop](./docs/screens/registro-chamado-desktop.png) | ![Novo chamado — mobile](./docs/screens/registro-chamado-mobile.png) |

### Doações e coletas
<a id="doacoes"></a>

`/doacoes` · autenticado (coleta: receptor) · referência: Squarespace

| Desktop | Mobile |
| :-: | :-: |
| ![Doações e coletas — desktop](./docs/screens/doacoes-desktop.png) | ![Doações e coletas — mobile](./docs/screens/doacoes-mobile.png) |

### Registrar doação de peças
<a id="registro-doacao"></a>

`/doacoes/nova` · autenticado (maker) · referência: Squarespace (formulário)

| Desktop | Mobile |
| :-: | :-: |
| ![Registrar doação de peças — desktop](./docs/screens/registro-doacao-desktop.png) | ![Registrar doação de peças — mobile](./docs/screens/registro-doacao-mobile.png) |

### Lotes
<a id="lotes"></a>

`/lotes · /lotes/:id` · receptor · referência: linguagem do app

| Desktop | Mobile |
| :-: | :-: |
| ![Lotes — desktop](./docs/screens/lotes-desktop.png) | ![Lotes — mobile](./docs/screens/lotes-mobile.png) |

### Empresas e instituições
<a id="instituicoes"></a>

`/instituicoes` · autenticado · referência: Squarespace

| Desktop | Mobile |
| :-: | :-: |
| ![Empresas e instituições — desktop](./docs/screens/instituicoes-desktop.png) | ![Empresas e instituições — mobile](./docs/screens/instituicoes-mobile.png) |

### Vagas e banco de currículos
<a id="vagas"></a>

`/vagas` · autenticado (candidatar: candidato) · referência: Squarespace

| Desktop | Mobile |
| :-: | :-: |
| ![Vagas e banco de currículos — desktop](./docs/screens/vagas-desktop.png) | ![Vagas e banco de currículos — mobile](./docs/screens/vagas-mobile.png) |

### Publicar vaga
<a id="registro-vaga"></a>

`/vagas/nova` · contratante · referência: Squarespace (formulário)

| Desktop | Mobile |
| :-: | :-: |
| ![Publicar vaga — desktop](./docs/screens/registro-vaga-desktop.png) | ![Publicar vaga — mobile](./docs/screens/registro-vaga-mobile.png) |

### Meu currículo
<a id="curriculo"></a>

`/curriculo` · candidato · referência: Squarespace (formulário)

| Desktop | Mobile |
| :-: | :-: |
| ![Meu currículo — desktop](./docs/screens/curriculo-desktop.png) | ![Meu currículo — mobile](./docs/screens/curriculo-mobile.png) |

### Portal de notícias
<a id="noticias"></a>

`/noticias` · autenticado · referência: New York Times News Portal

| Desktop | Mobile |
| :-: | :-: |
| ![Portal de notícias — desktop](./docs/screens/noticias-desktop.png) | ![Portal de notícias — mobile](./docs/screens/noticias-mobile.png) |

### Matéria
<a id="noticia"></a>

`/noticias/:id` · publicada; rascunho: autor e moderador · referência: New York Times News Portal

| Desktop | Mobile |
| :-: | :-: |
| ![Matéria — desktop](./docs/screens/noticia-desktop.png) | ![Matéria — mobile](./docs/screens/noticia-mobile.png) |

### Escrever notícia
<a id="registro-noticia"></a>

`/noticias/nova · /noticias/:id/editar` · publicador · referência: Squarespace (formulário)

| Desktop | Mobile |
| :-: | :-: |
| ![Escrever notícia — desktop](./docs/screens/registro-noticia-desktop.png) | ![Escrever notícia — mobile](./docs/screens/registro-noticia-mobile.png) |

### Vitrine de projetos
<a id="projetos"></a>

`/projetos` · autenticado · referência: Personal Portfolio

| Desktop | Mobile |
| :-: | :-: |
| ![Vitrine de projetos — desktop](./docs/screens/projetos-desktop.png) | ![Vitrine de projetos — mobile](./docs/screens/projetos-mobile.png) |

### Projeto
<a id="projeto"></a>

`/projetos/:id` · publicado; rascunho: autor e moderador · referência: Personal Portfolio (About)

| Desktop | Mobile |
| :-: | :-: |
| ![Projeto — desktop](./docs/screens/projeto-desktop.png) | ![Projeto — mobile](./docs/screens/projeto-mobile.png) |

### Enviar projeto 3D
<a id="registro-projeto"></a>

`/projetos/novo · /projetos/:id/editar` · autenticado (autor) · referência: Squarespace (formulário)

| Desktop | Mobile |
| :-: | :-: |
| ![Enviar projeto 3D — desktop](./docs/screens/registro-projeto-desktop.png) | ![Enviar projeto 3D — mobile](./docs/screens/registro-projeto-mobile.png) |

### Ranking e selos
<a id="ranking"></a>

`/ranking` · autenticado · referência: linguagem do app

| Desktop | Mobile |
| :-: | :-: |
| ![Ranking e selos — desktop](./docs/screens/ranking-desktop.png) | ![Ranking e selos — mobile](./docs/screens/ranking-mobile.png) |

### Minhas publicações
<a id="publicacoes"></a>

`/publicacoes` · autor · referência: linguagem do app

| Desktop | Mobile |
| :-: | :-: |
| ![Minhas publicações — desktop](./docs/screens/publicacoes-desktop.png) | ![Minhas publicações — mobile](./docs/screens/publicacoes-mobile.png) |

### Moderação e verificação
<a id="moderacao"></a>

`/moderacao` · moderador · referência: linguagem do app

| Desktop | Mobile |
| :-: | :-: |
| ![Moderação e verificação — desktop](./docs/screens/moderacao-desktop.png) | ![Moderação e verificação — mobile](./docs/screens/moderacao-mobile.png) |
