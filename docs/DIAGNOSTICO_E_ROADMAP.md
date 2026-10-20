# EcoHub 3D — Diagnóstico técnico e roadmap de arquitetura

> Referência: commit `2ba4c42` ("Versao inicial") × documento *Requisitos Plataforma Eco Hub 3d — Adapta One (outubro/2026)*.
> Escopo: `backend/` (Laravel 13 + Sanctum 4) e `frontend/` (React 19 + Tailwind 3 + MUI 9).
> Método: leitura integral do código, `php -l` em todos os controllers/models (sem erros de sintaxe). Não foi possível subir a aplicação: o `composer.lock` exige PHP ≥ 8.4.1 (ver D-02) e o ambiente de análise tem PHP 8.3.

---

## Sumário executivo

| Área | Situação real | Observação |
| :--- | :--- | :--- |
| Backend | **Protótipo, não "concluído"** | 7 entidades com CRUD parcial; o módulo Projeto quebra com erro fatal; quase nenhuma rota exige autenticação; o banco de dados não está versionado em migrations. |
| Frontend | **Protótipo visual** | Apenas Login, Cadastro de usuário, Home e Vagas consomem a API. Chamados, Projetos e Notícias usam dados *mock* fixos no código. |
| Cobertura dos requisitos | **≈ 10–15 %** | Dos 6 módulos do documento, só "Banco de currículos" (parcial) e um esboço do "Hub" (vagas/candidaturas) existem. Doações, reciclagem, repositório de modelos 3D e pedidos de escolas não existem. |
| Segurança | **Crítica** | Qualquer pessoa, sem login, lista todos os usuários (com CPF/CNPJ), altera o e-mail/senha de qualquer conta e apaga notícias, projetos, chamados e currículos. |

**As três primeiras ações, nesta ordem:**
1. Fechar as rotas (middleware `auth:sanctum` + Policies) e remover a listagem pública de usuários.
2. Escrever as migrations das tabelas existentes. Sem isso não há testes, deploy reproduzível nem colaboração.
3. Migrar o frontend de CRA para Vite e criar a camada `api/` única antes de integrar novas telas.

---

## 1. Diagnóstico geral do código

### 1.1 O que já funciona

- **Login com Sanctum** (`POST /api/login`): busca por e-mail, `Hash::check`, emite *personal access token*, expiração de 120 min (`config/sanctum.php`). O frontend guarda o token e o envia como `Bearer`.
- **Modelo `Usuario` customizado** como `Authenticatable` (tabela `usuario`, coluna `senha` com cast `hashed`, `getAuthPasswordName()`), já registrado em `config/auth.php`.
- **Vagas e candidaturas**: são os controllers mais maduros. `VagaController` e `CandidaturaController` têm escopo por dono (`abort_unless(... === $request->user()->id, 403)`), pegam o `id_usuario` do token e não do corpo da requisição, usam `firstOrCreate` contra duplicidade e restringem o status com `Rule::in`. Esse é o padrão a replicar.
- **Respostas JSON para exceções em `api/*`** (`bootstrap/app.php`).
- **Tela de Vagas** (`frontend/src/pages/Vaga.jsx`): tem um *helper* `request()` com token, tratamento de 401, estados de carregando/erro, busca e filtro. É o melhor ponto de partida para a camada de API do front.
- **Ferramental moderno instalado**: Laravel Boost (MCP), Pest 4, Pint, Pail.

### 1.2 Padrões em uso

| Camada | Padrão observado |
| :--- | :--- |
| Backend | MVC "magro": Controller → Model, sem Services/Policies/Resources. Dois estilos convivem: FormRequest (`ChamadoRequest`, etc.) e `$request->validate()` inline (Vaga, Candidatura). Nomes em português, FK no estilo `id_usuario` (o padrão do Laravel é `usuario_id`). Mistura `protected $casts` com `casts()` e atributos PHP 8 (`#[Fillable]`, `#[Hidden]`). |
| Frontend | Uma página = um arquivo grande (até 660 linhas) com subcomponentes, dados *mock*, estilos e chamadas `fetch` juntos. Estado só com `useState`/`useEffect`. Tailwind com valores arbitrários (`text-[11px]`, `bg-[#3800df]`) e MUI usado só para ícones e alguns inputs. |

### 1.3 Dívidas técnicas e inconsistências estruturais (priorizadas)

| ID | Severidade | Problema | Evidência |
| :--- | :--- | :--- | :--- |
| D-01 | **Crítica** | O schema do banco **não está em migrations**. Só existem `cache` e `personal_access_tokens`. As tabelas `usuario`, `vagas`, `candidaturas`, `curriculo`, `noticias`, `projetos` e `chamados` foram criadas à mão em SQL, como mostram comentários do tipo "caso você não tenha criado created_at e updated_at no SQL". Também faltam as migrations padrão de `sessions`, `jobs` e `password_reset_tokens`, e o `.env.example` usa `SESSION_DRIVER=database` e `QUEUE_CONNECTION=database`. | `backend/database/migrations/` |
| D-02 | **Crítica** | Versões de PHP inconsistentes: o `composer.json` declara `php: ^8.3`, o `composer.lock` exige ≥ 8.4.1 (Symfony 8.1), o `AGENTS.md` diz 8.5 e o README diz "8.0 ou superior". `composer install` falha em PHP 8.3. | `composer install` → "symfony/console v8.1.1 requires php >=8.4.1" |
| D-03 | **Crítica** | `ProjetoController` importa `App\Http\Requests\Projeto` (classe inexistente) e não importa `App\Models\Projeto`. **Todo** endpoint `/api/projeto` responde 500 (*Class not found*). O mesmo erro está em `ProjetoFactory`. | `ProjetoController.php:5`, `ProjetoFactory.php:5` |
| D-04 | Alta | `DatabaseSeeder` e `UserFactory` usam `App\Models\User`, que não existe. `php artisan db:seed` quebra. | `database/seeders/DatabaseSeeder.php` |
| D-05 | Alta | As factories não batem com as tabelas: usam `usuario_id`/`vaga_id` onde o model usa `id_usuario`/`id_vaga`, preenchem `created_at` em models com `$timestamps = false`, geram `status` booleano onde o domínio espera texto e `id_usuario => randomNumber()` sem FK. Nenhum teste de feature conseguirá usá-las. | `database/factories/*` |
| D-06 | Alta | Rotas e controllers estão dessincronizados. `show`/`update` existem nos controllers, mas não têm rota. `VagaController::minhas` e `CandidaturaController::porVaga`/`update` também não têm rota. O front chama `GET /api/vaga/minhas` e recebe 404/405. | `routes/api.php`, `Vaga.jsx:524` |
| D-07 | Alta | Controllers que dependem de `$request->user()` (Vaga e Candidatura) estão em rotas **sem** `auth:sanctum`. Sem token, a resposta é 500 ("property id on null") e não 401. | `routes/api.php` |
| D-08 | Média | FormRequests mortos ou incoerentes. `VagaRequest` e `CandidaturaRequest` não são usados. `CandidaturaRequest` valida `usuario_id`/`status: boolean`, que não existem nesse formato. `CurriculoRequest` exige o campo `usuario`, que não é coluna. Todos têm `authorize(): true`, regras sem tipo (`'titulo' => ['required']`) e nenhum `max`. | `app/Http/Requests/*` |
| D-09 | Média | Respostas inconsistentes: `destroy` devolve `200 {}` em uns controllers e `204` em outros; o login devolve `Mensagem` (maiúsculo) enquanto o Laravel devolve `message`; os models são retornados crus, sem API Resource (vaza todas as colunas). Também não há paginação: `Model::all()` em todos os `index`. | Controllers |
| D-10 | Média | Datas duplicadas: `chamados.data_criacao` e `*.data_publicacao` são preenchidas pelo cliente e convivem com `created_at`. | Models |
| D-11 | Média | O frontend usa **Create React App** (`react-scripts 5`, descontinuado), mas o README fala em Vite e porta 5173. O README também manda subir o back com `php -S` em vez de `php artisan serve`. | `frontend/package.json`, `README.md` |
| D-12 | Média | URL da API *hardcoded* (`http://localhost:8000`) em 5 arquivos, sem `.env`. Cada página reimplementa `fetch` + token + 401. | `Nav.jsx`, `Login.jsx`, `Home.jsx`, `CadastroUsuario.jsx`, `Vaga.jsx` |
| D-13 | Média | Arquivos trocados ou vazios: `CadastroVaga.jsx` contém uma cópia da Navbar, não um formulário. Há 13 arquivos vazios (9 `.css`, `HubNoticiasProjetos.jsx`, `SolicitaçoesChamados.jsx` com cedilha no nome, `VisualizacaoChamados.jsx` e `VisualizacaoCurriculo.jsx`, que são importados pelo `App.js` sem *export default*: a rota quebra ao renderizar, e o build quebra em CI, onde avisos do webpack viram erro). `HubVagas.jsx` está 100 % comentado. | `frontend/src` |
| D-14 | Média | Nomes de componentes herdados de exportação Figma/IA (`LayoutLuluMaster`, `Group`, `Layout`, `DashboardLuluMaster`, `VisualizacaoArtigoClean` repetido em duas páginas). | `export default function …` |
| D-15 | Baixa | `Vaga.jsx` redireciona para `/login`, rota que não existe (o login é `/`). Rotas com maiúsculas (`/Visualizacao/VisualizacaoVagas`) e sem parâmetro `:id`, então a tela de detalhe não sabe qual item mostrar. | `App.js`, `Vaga.jsx:97` |
| D-16 | Baixa | Fonte Google e CSS injetados via `<style dangerouslySetInnerHTML>` em 3 páginas; cor de marca `#3800df` repetida dezenas de vezes em vez de virar *token* no `tailwind.config.js`. | `Login.jsx`, `Home.jsx`, `CadastroUsuario.jsx` |
| D-17 | Baixa | `.junie/mcp/mcp.json` tem caminho absoluto do Windows (`C:\php\...`), que não funciona para outros devs nem para CI. `backend/config/database.php` está no `.gitignore` (credenciais devem ficar só no `.env`; o Laravel 11+ usa o default do framework quando o arquivo falta). | `.junie/`, `.gitignore` |
| D-18 | Baixa | Testes: só os `ExampleTest` do esqueleto. Não há CI. | `tests/` |

---

## 2. Análise completa de backend e frontend

### 2.1 Backend (Laravel)

#### Controllers
| Controller | Nota | Comentário |
| :--- | :---: | :--- |
| `VagaController` | B | Bom escopo por dono e validação inline correta. Falta Policy (o `abort_unless` está repetido), API Resource e paginação. `minhas` está sem rota. |
| `CandidaturaController` | B | Bom: status controlado pelo dono da vaga e `firstOrCreate`. Falta índice `UNIQUE(id_usuario,id_vaga)` no banco (`firstOrCreate` não é atômico sob concorrência). |
| `UsuarioController` | D | `index`/`show`/`update`/`destroy` públicos. `store` (cadastro) não verifica e-mail único. `update` usa o mesmo Request do cadastro (senha obrigatória). Não há `logout` nem "meus dados". |
| `Noticia`/`Chamado`/`Curriculo` | C− | Código de scaffold. Aceitam `id_usuario` do cliente (qualquer um publica "como" outro usuário) e não têm dono nem autorização. |
| `ProjetoController` | F | Erro fatal de *import* (D-03). |

**Recomendação de padrão:** Controller fino → `FormRequest` (validação + `authorize` via Policy) → `Action`/`Service` (regra de negócio) → `Model` → `JsonResource` (resposta). Use `Route::apiResource` com `->middleware('auth:sanctum')` e `$this->authorize()`/`Gate`.

#### Models
- Faltam relacionamentos inversos (`Usuario::vagas()`, `Usuario::curriculo()`, `Vaga::candidaturas()`). Não há `SoftDeletes` nem Enums nativos para `status`.
- `Usuario`: `sexo` como boolean é inadequado (use enum/string opcional ou remova; é dado sensível pela LGPD). `cpf`/`cnpj` devem ter cast `encrypted` ou ficar fora das respostas (`#[Hidden]`). Os flags `estudante`/`empresa` não comportam os perfis do requisito (maker, laboratório, escola, empresa, admin). Use papéis (ver §3).
- Padronize em `casts()` (método) e atributos `#[Fillable]`/`#[Hidden]` do Laravel 13, já que o projeto mistura os três estilos.

#### Requests
Reescrever todos com regras tipadas e limites, por exemplo:
```php
'titulo' => ['required', 'string', 'max:255'],
'email'  => ['required', 'email:rfc', 'max:255', Rule::unique('usuario')->ignore($this->usuario)],
'senha'  => [$this->isMethod('post') ? 'required' : 'sometimes', Password::min(8)->letters()->numbers()],
```
Separe `Store*Request` e `Update*Request`. Nunca valide `id_usuario` vindo do cliente; atribua `$request->user()->id` no servidor.

#### Migrations
São inexistentes para o domínio (D-01). O primeiro passo é gerar as migrations a partir do banco atual (`kitloong/laravel-migrations-generator` faz isso automaticamente) e passar a usar `foreignId()->constrained()->cascadeOnDelete()`, índices em colunas de filtro e `timestamps()`/`softDeletes()` em todas as tabelas de negócio.

#### Rotas
- **API:** sem versionamento, sem `auth:sanctum` (exceto `/usuario/me`), sem `throttle` no login e sem `apiResource`. Proposta:
  ```php
  Route::prefix('v1')->group(function () {
      Route::post('auth/login', LoginController::class)->middleware('throttle:login');
      Route::post('auth/register', RegisterController::class)->middleware('throttle:6,1');
      Route::get('rastreio/{lote:codigo}', RastreioController::class);           // público (QR Code)
      Route::apiResource('modelos', ModeloController::class)->only(['index','show']);

      Route::middleware('auth:sanctum')->group(function () {
          Route::post('auth/logout', LogoutController::class);
          Route::get('me', MeController::class);
          Route::apiResource('vagas', VagaController::class);
          Route::get('me/vagas', [VagaController::class, 'minhas']);
          // ... demais módulos
      });
  });
  ```
- **Web:** só a `welcome`. Como o front é SPA separado, está correto; apenas mantenha `/up` (health) e, se adotar autenticação SPA por cookie, a rota `/sanctum/csrf-cookie`.

### 2.2 Frontend (React)

| Aspecto | Situação | Recomendação |
| :--- | :--- | :--- |
| **Build** | CRA 5 (descontinuado, lento, sem suporte oficial a React 19). | Migrar para **Vite 7** (`npm create vite@latest`, copiar `src/`, renomear `.js`→`.jsx` com JSX, `REACT_APP_`→`VITE_`). A migração leva cerca de 1 hora. |
| **Componentização** | Páginas-monólito de 300–660 linhas. Subcomponentes úteis (`Avatar`, `UrgPill`, `StatusPill`, cartões, carrossel) estão presos dentro de cada página e duplicados (o carrossel de `VisualizacaoNoticia`/`Projeto`/`Vaga` é praticamente o mesmo). | Extrair para `shared/components/ui` (Button, Input, Select, Badge, Card, Modal, Avatar, Pagination, EmptyState, Spinner) e `shared/components/layout` (AppLayout com Nav + Footer + `<Outlet/>`). |
| **Estado** | `useState` + `useEffect` com `fetch` manual. Não há cache, *refetch* nem sessão global (a Navbar busca `/usuario/me` a cada página). | **TanStack Query** para estado de servidor e **AuthContext** (ou Zustand) com o usuário logado. Formulários com **React Hook Form + Zod**. |
| **Consumo da API** | `fetch` espalhado, URL fixa, tratamento de erro diferente em cada tela, mensagens do back com chaves divergentes (`Mensagem` × `message` × `errors`). | Um `apiClient` (axios ou `ky`) com `baseURL` vinda de `import.meta.env.VITE_API_URL`, *interceptor* de token/401 e normalização de erros 422 → `{campo: mensagem}`. Um arquivo de serviço por módulo. |
| **Tailwind** | Bem usado em layout, mas com muitos valores arbitrários e cor de marca *hardcoded*. MUI e Emotion coexistem só por ícones e 3–4 inputs (cerca de 300 kB a mais no bundle). | Definir *design tokens* no `tailwind.config.js` (`colors.brand`, `fontFamily.sans: ['Inter']`, `fontSize`). Trocar MUI por **lucide-react** (ícones) + **Radix UI / shadcn/ui** (Dialog, Select, Collapse). Avaliar Tailwind v4 depois da migração para Vite. |
| **Páginas e rotas** | Rotas com maiúsculas e sem `:id`; telas de cadastro e visualização órfãs; `RotaProtegida` confia só na existência do token. | Rotas em *kebab-case* com parâmetros (`/vagas/:id`, `/modelos/:slug`), `lazy()` por rota, guarda por papel (`<RequireRole role="laboratorio">`) e página 404. |
| **Estilos** | 9 `.css` vazios, `@import` de fonte via `<style>` injetado. | Apagar os vazios, carregar a fonte no `index.html` (ou `@fontsource/inter`) e usar só `index.css` com `@tailwind` e `@layer components` para classes recorrentes (`.input-group`, `.btn-base`). |
| **Acessibilidade** | Inputs sem `<label htmlFor>`, botões só com ícone e sem `aria-label`, contraste `#858585` em fundo branco (≈ 3.7:1, abaixo do AA para texto pequeno). | `eslint-plugin-jsx-a11y` e revisão com axe DevTools. |

---

## 3. Mapeamento de lacunas (lógica e banco de dados)

### 3.1 Cruzamento requisito × código atual

| # | Módulo do documento | Existe hoje? | O que existe | Lacuna |
| :-: | :--- | :---: | :--- | :--- |
| 1 | Doação de makers | ❌ | — | Tudo: cadastro de doação, fotos, polímero, peso, localização. |
| 2 | Receptores e reciclagem | ❌ | — | Cadastro de laboratórios/grupos, polímeros aceitos, capacidade, fluxo de solicitação e agendamento de coleta. |
| 3 | Repositório de projetos | 🟡 5 % | `projetos` (título, tema, empresa, texto): é uma vitrine/notícia, não um catálogo de peças. | Arquivos STL/3MF, áreas (saúde/educação/agro/acessibilidade), instruções de impressão, licença, busca por filtros, moderação. |
| 4 | Pedidos de escolas públicas | 🟡 5 % | `chamados` (título, descrição, prazo, status texto); a tela usa *mock* de helpdesk de TI. | Tipo de demanda (treinamento/scanner/modelagem), escola (código INEP), índice de vulnerabilidade, priorização, pareamento com voluntários. |
| 5 | Banco de currículos | 🟡 35 % | `curriculo` (cargo, habilidades/competências em texto livre, datas), `vagas`, `candidaturas`. | Portfólio de peças, especialidades estruturadas, busca por empresas com filtros, visibilidade/LGPD, múltiplas experiências. |
| 6 | Hub de conexão | 🟡 10 % | Vagas + candidaturas fazem um "match" de emprego. | Mural de demandas/ofertas de impressão e resíduo, respostas/interesse, mensagens, notificações. |
| — | Marketplace de serviços | ❌ | — | Perfis de máquina, orçamento automático, pedido de serviço, avaliação mútua, reputação. |
| — | Rastreabilidade (QR Code) | ❌ | — | Lotes de filamento, origem do resíduo, eventos, página pública de rastreio, geração/leitura de QR. |
| — | Painel de impacto | ❌ | — | Agregados (kg desviados, peças doadas, escolas atendidas) e export para relatórios FINEP/CNPq. |
| — | Gamificação | ❌ | — | Pontos, selos, ranking. |
| — | Mapa interativo | ❌ | Só `cep`/`cidade` em vagas. | Latitude/longitude em todos os atores, pontos de coleta, consulta por raio. |
| — | Fórum / base de conhecimento | 🟡 | `noticias` | Tópicos, respostas, categorias, FAQ. |
| — | Controle de qualidade | ❌ | — | Laudos (diâmetro, resistência, temperatura) vinculados ao lote. |
| — | Agenda de eventos | ❌ | — | Eventos e inscrições. |
| — | Curadoria e segurança | ❌ | — | Moderação, denúncias, licenças. |
| — | API pública / integrações | ❌ | — | Versionamento, tokens com *abilities*, sincronização com Printables/Thingiverse. |
| — | App mobile | ❌ | — | Push tokens, endpoints de proximidade, leitura de QR. |

### 3.2 Tabelas, colunas e chaves estrangeiras que faltam

> Convenção proposta para **tabelas novas**: plural em português, PK `id` (bigint), FK `<entidade>_id` via `foreignId()->constrained()`, `timestamps()`, `softDeletes()` em entidades de negócio e enums PHP nativos com cast. Migrar as antigas (`id_usuario` → `usuario_id`, `usuario` → `usuarios`, `curriculo` → `curriculos`) numa migration de *rename* única, antes de crescer.

#### 3.2.0 Núcleo (pré-requisito de todos os módulos)

| Tabela | Colunas principais | FKs / índices |
| :--- | :--- | :--- |
| `usuarios` *(alterar)* | + `email_verified_at`, `remember_token`, `avatar_path`, `bio`, `cidade`, `uf` (char 2), `latitude` decimal(10,7), `longitude` decimal(10,7), `pontos_total` int default 0, `reputacao_media` decimal(3,2), `reputacao_qtd` int, `aceite_termos_em`, `deleted_at`. Remover `estudante`/`empresa`/`sexo` (papéis passam para a tabela abaixo). | `UNIQUE(email)`, `UNIQUE(cpf)`, índice `(uf, cidade)` |
| `roles`, `model_has_roles`, `permissions`… | via **spatie/laravel-permission**. Papéis: `maker`, `laboratorio`, `escola`, `empresa`, `estudante`, `moderador`, `admin`. | — |
| `instituicoes` | `tipo` enum(`laboratorio`,`grupo_pesquisa`,`escola_publica`,`empresa`,`ong`), `nome`, `slug`, `cnpj` null, `codigo_inep` null, `descricao`, `site`, `capacidade_kg_mes` decimal null, `cidade`, `uf`, `latitude`, `longitude`, `verificada_em` null | `responsavel_id → usuarios`; índices `(tipo)`, `(uf,cidade)`, `UNIQUE(codigo_inep)` |
| `instituicao_usuario` | `papel` enum(`responsavel`,`membro`) | `instituicao_id`, `usuario_id`; `UNIQUE(instituicao_id, usuario_id)` |
| `polimeros` | `sigla` (PLA, PETG, ABS, TPU, PET, PP…), `nome`, `densidade_g_cm3`, `temp_extrusao_min/max`, `reciclavel` bool | `UNIQUE(sigla)` (catálogo, deve ser cacheado) |
| `areas` | `nome`, `slug` (saúde, educação, agro, acessibilidade…) | `UNIQUE(slug)` |
| `anexos` *(polimórfica)* | `anexavel_type`, `anexavel_id`, `tipo` enum(`foto`,`stl`,`3mf`,`laudo`,`documento`), `disco`, `caminho`, `nome_original`, `mime`, `tamanho_bytes`, `sha256`, `status_verificacao` enum(`pendente`,`aprovado`,`rejeitado`), `metadados` json (volume, bounding box, nº de triângulos) | `usuario_id → usuarios`; índice `(anexavel_type, anexavel_id)`; `INDEX(sha256)`. *(Ou `media` do spatie/laravel-medialibrary.)* |

#### 3.2.1 Módulo 1 — Doação de makers
| Tabela | Colunas | FKs |
| :--- | :--- | :--- |
| `doacoes` | `tipo` enum(`peca_excedente`,`carretel_usado`,`resto_filamento`), `titulo`, `descricao`, `peso_estimado_g` int, `peso_real_g` int null, `quantidade` int, `cor` null, `cidade`, `uf`, `latitude`, `longitude`, `status` enum(`disponivel`,`reservada`,`coletada`,`entregue`,`cancelada`), `disponivel_ate` date null | `doador_id → usuarios`, `polimero_id → polimeros`, `ponto_coleta_id → pontos_coleta` null; índices `(status, polimero_id)`, `(latitude, longitude)` |
| fotos | via `anexos` (`tipo=foto`, até 5) | — |

#### 3.2.2 Módulo 2 — Receptores e reciclagem
| Tabela | Colunas | FKs |
| :--- | :--- | :--- |
| `instituicao_polimero` | `aceita_contaminado` bool, `peso_minimo_g` int null, `observacoes` | `instituicao_id`, `polimero_id`; `UNIQUE(par)` |
| `area_instituicao` | — | `area_id`, `instituicao_id` |
| `pontos_coleta` | `nome`, `endereco`, `cidade`, `uf`, `latitude`, `longitude`, `horario_funcionamento` json, `ativo` | `instituicao_id → instituicoes` |
| `solicitacoes_coleta` | `modalidade` enum(`coleta`,`entrega`), `status` enum(`pendente`,`aceita`,`recusada`,`agendada`,`concluida`,`cancelada`), `agendado_para` datetime null, `endereco`, `peso_recebido_g` null, `motivo_recusa`, `concluida_em` | `doacao_id → doacoes`, `instituicao_id → instituicoes`, `solicitante_id → usuarios`; índice `(instituicao_id, status)` |
| `lotes_filamento` | `codigo` char(26) **ULID público para o QR**, `peso_entrada_g`, `peso_saida_g`, `diametro_nominal_mm` decimal(4,2), `cor`, `status` enum(`em_processamento`,`aguardando_laudo`,`aprovado`,`reprovado`,`distribuido`), `produzido_em` | `instituicao_id → instituicoes`, `polimero_id → polimeros`; `UNIQUE(codigo)` |
| `lote_origens` | `peso_g` | `lote_id → lotes_filamento`, `solicitacao_coleta_id → solicitacoes_coleta` (ligação resíduo → lote) |
| `lote_eventos` | `tipo` enum(`coletado`,`triturado`,`extrudado`,`laudo_emitido`,`enviado`,`utilizado`), `ocorrido_em`, `dados` json | `lote_id`, `responsavel_id → usuarios` (linha do tempo da rastreabilidade) |
| `laudos_qualidade` | `diametro_medio_mm`, `tolerancia_mm`, `ovalidade`, `resistencia_tracao_mpa`, `alongamento_pct`, `temp_impressao_min/max`, `umidade_pct`, `resultado` enum(`aprovado`,`reprovado`,`restrito`), `emitido_em` | `lote_id → lotes_filamento`, `laboratorio_id → instituicoes`, `emitido_por → usuarios`; PDF via `anexos` (`tipo=laudo`) |

#### 3.2.3 Módulo 3 — Repositório de projetos (modelos 3D)
| Tabela | Colunas | FKs |
| :--- | :--- | :--- |
| `licencas` | `sigla` (CC-BY, CC-BY-SA, CC-BY-NC, CC0, GPL-3.0), `nome`, `url`, `permite_uso_comercial`, `permite_derivados` | `UNIQUE(sigla)` |
| `modelos` | `titulo`, `slug`, `descricao`, `instrucoes_impressao` json (`altura_camada`, `infill`, `suporte`, `bico`, `temp`), `volume_cm3` decimal null, `tempo_estimado_min` null, `status_moderacao` enum(`rascunho`,`em_revisao`,`publicado`,`bloqueado`), `motivo_bloqueio`, `downloads_count`, `favoritos_count`, `origem` enum(`local`,`printables`,`thingiverse`), `url_externa`, `publicado_em` | `autor_id → usuarios`, `area_id → areas`, `licenca_id → licencas`, `polimero_recomendado_id → polimeros` null, `moderado_por → usuarios` null; `UNIQUE(slug)`, `FULLTEXT(titulo, descricao)`, índice `(status_moderacao, area_id)` |
| arquivos | via `anexos` (`stl`/`3mf`/`foto`); opcional `modelo_versoes` (`versao`, `changelog`) | `modelo_id` |
| `tags`, `taggables` | `nome`, `slug` | polimórfico |
| `favoritos` | — | `usuario_id`, `modelo_id`; `UNIQUE(par)` |
| `downloads` | `ip_hash`, `created_at` | `modelo_id`, `usuario_id` null |
| `projetos` *(atual)* | Manter como "Projetos/Notícias de iniciativas" ou fundir em `noticias` com `tipo`. | — |

#### 3.2.4 Módulo 4 — Pedidos de escolas públicas
| Tabela | Colunas | FKs |
| :--- | :--- | :--- |
| `pedidos_escola` *(substitui/evolui `chamados`)* | `tipo` enum(`treinamento_impressao`,`scanner_3d`,`modelagem`,`impressao_peca`,`manutencao`), `titulo`, `descricao`, `publico_estimado` int, `data_desejada` date, `modalidade` enum(`presencial`,`remoto`), `indice_vulnerabilidade` decimal(5,2) (INSE/IDEB), `prioridade` int (calculada), `status` enum(`aberto`,`em_triagem`,`pareado`,`em_execucao`,`concluido`,`cancelado`), `concluido_em` | `escola_id → instituicoes` (tipo escola), `solicitante_id → usuarios`; índice `(status, prioridade DESC)` |
| `pareamentos` | `voluntario_type`, `voluntario_id` (usuário maker **ou** instituição), `score_compatibilidade` decimal, `status` enum(`sugerido`,`convidado`,`aceito`,`recusado`,`concluido`), `aceito_em`, `relato_conclusao` | `pedido_escola_id → pedidos_escola`; `UNIQUE(pedido, voluntario)` |

#### 3.2.5 Módulo 5 — Banco de currículos
| Tabela | Colunas | FKs |
| :--- | :--- | :--- |
| `perfis_profissionais` *(substitui `curriculo` flat)* | `titulo`, `resumo`, `disponibilidade` enum, `modalidade` enum(`presencial`,`remoto`,`hibrido`), `linkedin_url`, `portfolio_url`, `visivel_para_empresas` bool, `cidade`, `uf` | `usuario_id → usuarios` `UNIQUE` (1:1) |
| `especialidades` | `nome`, `slug`, `categoria` (modelagem, pós-processamento, manutenção, CAD, scanner…) | `UNIQUE(slug)` |
| `especialidade_usuario` | `nivel` enum(`basico`,`intermediario`,`avancado`) | `usuario_id`, `especialidade_id`; `UNIQUE(par)` |
| `experiencias` | `cargo`, `organizacao`, `inicio`, `fim` null, `descricao` | `usuario_id` |
| `formacoes` | `curso`, `instituicao`, `nivel`, `inicio`, `fim` | `usuario_id` |
| `portfolio_itens` | `titulo`, `descricao` + fotos via `anexos` | `usuario_id`, `modelo_id → modelos` null |
| `vagas` *(alterar)* | + `modalidade`, `faixa_salarial_min/max`, `status` enum(`aberta`,`pausada`,`encerrada`), `expira_em`, `created_at/updated_at` | + `instituicao_id → instituicoes` null; FK real `usuario_id`; `vaga_especialidade` (pivot) |
| `candidaturas` *(alterar)* | + `mensagem`, `updated_at` | FK `usuario_id`, `vaga_id` com `cascadeOnDelete`; **`UNIQUE(usuario_id, vaga_id)`** |

#### 3.2.6 Módulo 6 — Hub de conexão
| Tabela | Colunas | FKs |
| :--- | :--- | :--- |
| `anuncios` (mural) | `tipo` enum(`demanda`,`oferta`), `categoria` enum(`impressao_peca`,`residuo`,`reciclagem`,`servico`,`equipamento`), `titulo`, `descricao`, `quantidade`, `cidade`, `uf`, `latitude`, `longitude`, `status` enum(`aberto`,`em_negociacao`,`atendido`,`expirado`), `expira_em` | `autor_id → usuarios`, `polimero_id` null, `referencia_type/id` (doação, modelo) null; índice `(categoria, tipo, status)` |
| `anuncio_interesses` | `mensagem`, `status` enum(`enviado`,`aceito`,`recusado`) | `anuncio_id`, `usuario_id`; `UNIQUE(par)` |
| `conversas`, `conversa_participantes`, `mensagens` | `assunto_type/id` (contexto); `corpo`, `lida_em` | `conversa_id`, `usuario_id` |
| `notifications` | padrão do Laravel (`php artisan make:notifications-table`) | morph `notifiable` |

#### 3.2.7 Funcionalidades sugeridas
| Funcionalidade | Tabelas |
| :--- | :--- |
| **Perfis de máquina** | `impressoras` (`usuario_id`, `instituicao_id` null, `fabricante`, `modelo`, `tecnologia` enum(FDM, SLA, SLS), `volume_x/y/z_mm`, `bico_mm`, `horas_ociosas_semana`, `valor_hora` decimal, `ativa`), `impressora_polimero` (pivot com `preco_grama`) |
| **Marketplace** | `orcamentos` (`demandante_id`, `maker_id`, `impressora_id`, `modelo_id`/`anexo_id`, `polimero_id`, `volume_cm3`, `peso_g`, `tempo_min`, `valor_material`, `valor_maquina`, `valor_total`, `status` enum(`rascunho`,`enviado`,`aceito`,`recusado`,`expirado`), `valido_ate`), `pedidos_servico` (`orcamento_id` UNIQUE, `status` enum(`em_producao`,`enviado`,`entregue`,`disputa`,`cancelado`), `codigo_rastreio_envio`, `entregue_em`) |
| **Avaliação/Reputação** | `avaliacoes` (`avaliador_id`, `avaliado_id`, `avaliavel_type/id` → pedido_servico / solicitacao_coleta / pareamento, `nota` tinyint 1–5, `comentario`; `UNIQUE(avaliador_id, avaliavel_type, avaliavel_id)`); agregado desnormalizado em `usuarios.reputacao_*` via Observer |
| **Rastreabilidade QR** | `lotes_filamento.codigo` + `lote_origens` + `lote_eventos` + `laudos_qualidade` (acima). O QR aponta para `https://ecohub3d…/rastreio/{codigo}`. |
| **Painel de impacto** | `metricas_impacto_diarias` (`data`, `instituicao_id` null, `kg_desviados`, `pecas_doadas`, `escolas_atendidas`, `alunos_impactados`, `lotes_produzidos`, `co2_evitado_kg`), preenchida por *job* agendado (`Schedule::job(...)->daily()`) a partir das tabelas transacionais |
| **Gamificação** | `pontuacoes` (*ledger* imutável: `usuario_id`, `acao` enum, `pontos`, `origem_type/id`, `created_at`; `UNIQUE(usuario_id, acao, origem_type, origem_id)` contra duplicidade), `selos` (`slug`, `nome`, `descricao`, `icone`, `criterio` json), `selo_usuario` (`conquistado_em`); ranking em cache/Redis *sorted set* |
| **Mapa** | `latitude`/`longitude` em `instituicoes`, `pontos_coleta`, `doacoes`, `anuncios`, `usuarios` (opcional `POINT SRID 4326` + `SPATIAL INDEX` no MySQL 8 para `ST_Distance_Sphere`) |
| **Fórum/KB** | `forum_categorias`, `forum_topicos` (`categoria_id`, `autor_id`, `titulo`, `corpo_md`, `fixado`, `resolvido`), `forum_respostas` (`topico_id`, `autor_id`, `corpo_md`, `aceita`); `artigos` ou `noticias.tipo` enum(`noticia`,`tutorial`,`faq`) |
| **Eventos** | `eventos` (`organizador_id`, `instituicao_id`, `tipo` enum(`workshop`,`hackathon`,`mutirao`), `titulo`, `descricao`, `inicio`, `fim`, `local`, `latitude/longitude`, `vagas`, `online_url`), `inscricoes_evento` (`evento_id`, `usuario_id`, `status`, `checkin_em`; `UNIQUE(par)`) |
| **Curadoria** | `denuncias` (`denunciante_id`, `denunciavel_type/id`, `motivo` enum, `descricao`, `status`, `resolvida_por`), `moderacoes` (log: `moderador_id`, `moderavel_type/id`, `acao`, `justificativa`) |
| **Integrações/API** | `integracoes_externas` (`provedor`, `id_externo`, `modelo_id`, `sincronizado_em`, `payload` json); tokens Sanctum com *abilities* |
| **Mobile** | `dispositivos` (`usuario_id`, `plataforma`, `push_token` UNIQUE, `ultimo_acesso_em`) |

### 3.3 Lógica de negócio, rotas e telas a desenvolver

| Módulo | Regras de negócio (Services/Actions) | Endpoints (prefixo `/api/v1`) | Páginas/componentes |
| :--- | :--- | :--- | :--- |
| **Base** | `RegisterUser`, `IssueToken`, `Logout`, verificação de e-mail, reset de senha, atribuição de papel no cadastro, Policies para todos os models | `auth/register`, `auth/login`, `auth/logout`, `auth/forgot-password`, `auth/reset-password`, `me` (GET/PATCH), `me/avatar` | `AuthProvider`, `AppLayout`, `RequireRole`, `/perfil`, `/configuracoes`, 404 |
| **1 Doações** | `CriarDoacao` (valida fotos e geolocaliza o CEP via ViaCEP + Nominatim), transições de status com máquina de estados (`spatie/laravel-model-states` ou enum com `canTransitionTo`) | `doacoes` (CRUD), `doacoes/{id}/fotos`, `me/doacoes` | `/doacoes` (lista + filtros + mapa), `/doacoes/nova` (wizard: tipo → polímero → peso → fotos → local), `/doacoes/:id` |
| **2 Reciclagem** | `SolicitarColeta` (bloqueia a doação: `disponivel → reservada`), `AceitarSolicitacao`, `AgendarColeta` (notifica as duas partes), `ConcluirColeta` (registra peso real, gera pontos e atualiza o impacto), `CriarLote`, `RegistrarEventoLote` | `instituicoes`, `instituicoes/{id}/polimeros`, `solicitacoes-coleta` (+ `/aceitar`, `/recusar`, `/agendar`, `/concluir`), `lotes`, `lotes/{id}/eventos`, `lotes/{id}/laudos` | `/laboratorios`, `/laboratorios/:slug`, painel do laboratório (fila de solicitações em kanban, calendário de coletas, lotes) |
| **3 Repositório** | `PublicarModelo` (upload → validação → *job* de análise → `em_revisao`), `ModerarModelo`, `RegistrarDownload` (URL assinada temporária), busca (Scout + Meilisearch ou FULLTEXT) | `modelos` (index com `?area=&polimero=&licenca=&q=&sort=`), `modelos/{slug}`, `modelos/{id}/download`, `modelos/{id}/favorito`, `moderacao/modelos` | `/modelos` (grade + filtros), `/modelos/:slug` (visualizador 3D com `@react-three/fiber` + `STLLoader`/`3MFLoader`), `/modelos/novo`, fila de moderação |
| **4 Escolas** | `CalcularPrioridade` (vulnerabilidade × tempo em fila × público), `SugerirVoluntarios` (distância + especialidades + máquinas compatíveis + reputação), `ConvidarVoluntario`, `ConcluirPedido` | `pedidos-escola` (CRUD), `pedidos-escola/{id}/sugestoes`, `pareamentos` (+ `/aceitar`, `/recusar`, `/concluir`) | `/escolas/pedidos/novo` (formulário guiado), `/escolas/pedidos` (fila priorizada, para voluntários), painel da escola |
| **5 Currículos** | `BuscarTalentos` (filtros por especialidade, nível, cidade/raio, disponibilidade), respeito a `visivel_para_empresas` | `me/perfil-profissional`, `me/experiencias`, `me/portfolio`, `talentos` (só papel `empresa`), `vagas`, `me/vagas`, `vagas/{id}/candidaturas`, `candidaturas/{id}` (PATCH status) | `/talentos`, `/talentos/:id`, editor de currículo em seções, `/vagas`, painel do empregador (já esboçado em `Painel/Empregador.jsx`) |
| **6 Hub** | `PublicarAnuncio`, `SugerirMatches` (demanda ↔ oferta por categoria, polímero e distância), `ManifestarInteresse`, `IniciarConversa`, Notifications (database + mail + broadcast) | `anuncios`, `anuncios/{id}/interesses`, `conversas`, `conversas/{id}/mensagens`, `notificacoes` | `/hub` (mural com abas Demanda/Oferta + mapa), `/hub/:id`, `/mensagens`, sino de notificações (`ModalNotificacao.jsx` já existe) |
| **Marketplace** | `CalculadoraOrcamento` (interface; ver §4): `peso = volume × densidade × fator_infill`; `custo = peso × preço_g + tempo × valor_hora + margem`; tempo estimado por volume e vazão do bico, ou via *slicer* CLI em *job* | `impressoras`, `orcamentos` (POST calcula), `orcamentos/{id}/aceitar`, `pedidos-servico`, `avaliacoes` | `/makers` (busca por máquina/material), "Solicitar orçamento" na página do modelo, `/pedidos` |
| **Rastreabilidade** | `GerarQrLote` (SVG via `simplesoftwareio/simple-qrcode` ou `endroid/qr-code`), timeline pública só com dados não pessoais | `GET rastreio/{codigo}` (**público**, *throttle*), `lotes/{id}/qrcode.svg` | `/rastreio/:codigo` (pública, mobile-first), leitor de QR no front (`@yudiel/react-qr-scanner`), etiqueta para impressão |
| **Impacto** | `AgregarMetricasDiarias` (*job* agendado), fatores de conversão configuráveis | `impacto/resumo`, `impacto/serie?de=&ate=`, `impacto/export.csv|pdf` | `/impacto` (pública: KPIs + gráficos com Recharts), export para editais |
| **Gamificação** | `ConcederPontos` via *listeners* de eventos de domínio (`ColetaConcluida`, `ModeloPublicado`, `PedidoEscolaConcluido`, `MentoriaRealizada`), `AvaliarSelos` | `ranking?tipo=maker|laboratorio&periodo=`, `me/pontos`, `me/selos` | `/ranking`, selos no perfil |
| **Mapa** | Consulta por raio (Haversine ou `ST_Distance_Sphere`), *clusterização* no front | `mapa/pontos?lat=&lng=&raio=&tipos[]=` | `/mapa` com **react-leaflet** + OpenStreetMap + `leaflet.markercluster` |
| **Fórum/Eventos/Curadoria** | Markdown sanitizado, inscrição com limite de vagas (lock otimista), denúncia → fila de moderação | `forum/*`, `eventos`, `eventos/{id}/inscricao`, `denuncias`, `moderacao/*` | `/forum`, `/eventos`, `/admin/moderacao` (avaliar **Filament 4** para o painel admin inteiro) |

**Ordem sugerida de implementação (sprints de cerca de 2 semanas):**
1. Fundação: migrations, segurança, Policies, Resources, Vite, apiClient, AuthProvider, CI.
2. Núcleo: instituições, polímeros, anexos, papéis e mapa básico.
3. Módulos 1 e 2: doação → solicitação → coleta → lote. Fecha o ciclo da economia circular.
4. Rastreabilidade QR e laudos de qualidade.
5. Módulo 3: repositório com upload seguro e visualizador 3D.
6. Módulo 4: pedidos de escolas com priorização e pareamento.
7. Módulos 5 e 6: evolução de currículos e Hub.
8. Painel de impacto e gamificação.
9. Marketplace e avaliações.
10. Fórum, eventos, API pública e PWA/mobile.

---

## 4. Estrutura de pastas ideal

### 4.1 `backend/`
Organização **por camada com subpastas por módulo**. É escalável sem o custo de um DDD completo, e o Laravel Boost e as convenções do framework continuam funcionando.

```
backend/
├── app/
│   ├── Actions/                      # 1 classe = 1 caso de uso (método handle/execute)
│   │   ├── Doacoes/CriarDoacao.php
│   │   ├── Reciclagem/{SolicitarColeta,ConcluirColeta,CriarLote}.php
│   │   ├── Escolas/CalcularPrioridade.php
│   │   └── Gamificacao/ConcederPontos.php
│   ├── Contracts/                    # INTERFACES (só onde há troca real de implementação)
│   │   ├── Orcamento/CalculadoraOrcamento.php
│   │   ├── Arquivos/AnalisadorModelo3D.php
│   │   ├── Arquivos/AntivirusScanner.php
│   │   ├── Geo/Geocodificador.php
│   │   └── Integracoes/RepositorioExternoModelos.php
│   ├── Services/                     # implementações e orquestração com dependências externas
│   │   ├── Orcamento/CalculadoraPorVolume.php
│   │   ├── Arquivos/{AnalisadorStl,Analisador3mf,ClamAvScanner}.php
│   │   ├── Geo/{ViaCepNominatimGeocodificador}.php
│   │   ├── Integracoes/{PrintablesClient,ThingiverseClient}.php
│   │   └── Impacto/AgregadorMetricas.php
│   ├── Repositories/                 # OPCIONAL: só consultas complexas reutilizadas (busca geográfica, ranking)
│   │   ├── MapaRepository.php
│   │   └── RankingRepository.php
│   ├── Enums/                        # StatusDoacao, TipoInstituicao, Papel, StatusModeracao...
│   ├── Events/  Listeners/           # ColetaConcluida → ConcederPontos, AtualizarImpacto
│   ├── Jobs/                         # ProcessarModelo3D, EscanearAnexo, AgregarImpactoDiario
│   ├── Notifications/
│   ├── Observers/                    # AvaliacaoObserver → recalcula reputação
│   ├── Policies/                     # 1 por Model (auto-discovery)
│   ├── Rules/                        # ArquivoStlValido, Arquivo3mfValido, Cpf, Cnpj
│   ├── Support/                      # UTILITÁRIOS puros: Haversine, Formatadores, Slug
│   ├── Http/
│   │   ├── Controllers/Api/V1/{Auth,Doacoes,Reciclagem,Modelos,Escolas,Curriculos,Hub,Marketplace,Impacto}/
│   │   ├── Requests/Api/V1/{mesmos módulos}/Store*Request.php, Update*Request.php
│   │   ├── Resources/V1/{...}Resource.php
│   │   └── Middleware/
│   ├── Models/
│   └── Providers/AppServiceProvider.php   # bind Contracts → Services; Model::shouldBeStrict()
├── database/{migrations,factories,seeders}   # seeders de catálogo: Polimeros, Licencas, Areas, Especialidades, Papeis
├── routes/
│   ├── api.php                       # só require dos arquivos v1
│   └── api/v1/{auth,doacoes,reciclagem,modelos,escolas,curriculos,hub,marketplace,publico}.php
└── tests/
    ├── Feature/Api/V1/<Modulo>/*Test.php
    └── Unit/{Actions,Services,Support}/
```
**Sobre o padrão Repository:** o Eloquent já é um repositório. Interfaces de repositório para cada model criam boilerplate sem ganho em um projeto deste porte. Reserve `Contracts/` para fronteiras reais (cálculo de orçamento, antivírus, geocodificação, APIs externas), que são justamente as que você vai querer *mockar* nos testes e trocar no futuro. Faça o *binding* no `AppServiceProvider`:
```php
$this->app->bind(CalculadoraOrcamento::class, CalculadoraPorVolume::class);
```

### 4.2 `frontend/` (após migrar para Vite)
Organização **por feature**:
```
frontend/
├── index.html
├── vite.config.js                    # alias '@' → src, proxy /api → :8000 em dev
├── .env.example                      # VITE_API_URL=http://localhost:8000/api/v1
└── src/
    ├── main.jsx
    ├── app/
    │   ├── router.jsx                # createBrowserRouter + lazy() por rota
    │   ├── providers.jsx             # QueryClientProvider, AuthProvider, Toaster
    │   └── guards/{RequireAuth,RequireRole,GuestOnly}.jsx
    ├── features/
    │   ├── auth/      {api.js, hooks/useAuth.js, pages/LoginPage.jsx, pages/RegisterPage.jsx, components/}
    │   ├── doacoes/   {api.js, hooks/useDoacoes.js, pages/, components/DoacaoCard.jsx, schemas.js}
    │   ├── reciclagem/
    │   ├── modelos/   {..., components/Viewer3D.jsx (lazy)}
    │   ├── escolas/
    │   ├── curriculos/
    │   ├── vagas/
    │   ├── hub/
    │   ├── marketplace/
    │   ├── rastreio/
    │   ├── impacto/
    │   └── mapa/
    ├── shared/
    │   ├── components/
    │   │   ├── ui/          # Button, Input, Select, Badge, Card, Modal, Avatar, Pagination, Spinner, EmptyState
    │   │   └── layout/      # AppLayout, Navbar, Footer, Sidebar
    │   ├── lib/
    │   │   ├── apiClient.js # axios.create + interceptors (token, 401, normalização de erro 422)
    │   │   └── queryClient.js
    │   ├── hooks/           # useDebounce, useGeolocation, usePagination
    │   ├── utils/           # formatters (peso, data, moeda), constants, enums espelhados do back
    │   └── assets/
    ├── styles/index.css     # @tailwind + @layer components
    └── test/                # setup do Vitest + MSW
```
Regra: uma feature só importa de `shared/` e dela mesma. Componentes reutilizados por duas features sobem para `shared/`.

---

## 5. Segurança e otimização

### 5.1 Vulnerabilidades encontradas (corrigir já)

| ID | Severidade | Vulnerabilidade | Correção |
| :--- | :--- | :--- | :--- |
| S-01 | **Crítica** | `GET /api/usuario` e `/usuario/{id}` são **públicos** e devolvem todos os usuários com **CPF, CNPJ, telefone e e-mail** (só `senha` está oculta). Isso é exposição de dados pessoais (LGPD). | Remover `index`; `show` só com `auth:sanctum` + Policy + `UsuarioResource` sem documentos; `cpf`/`cnpj` com cast `encrypted` e `#[Hidden]`. |
| S-02 | **Crítica** | `PUT /api/usuario/{id}` e `DELETE /api/usuario/{id}` sem autenticação: **qualquer pessoa troca o e-mail/senha de qualquer conta (account takeover) ou a apaga**. | Mover para `PATCH /me` e `DELETE /me` autenticados; troca de senha exige a senha atual. |
| S-03 | **Crítica** | `POST`/`DELETE` de notícia, projeto, chamado e currículo sem autenticação, e o `id_usuario` vem do corpo. Permite apagar conteúdo de terceiros e publicar se passando por outro usuário. | `auth:sanctum` + Policies + `id_usuario = $request->user()->id`. |
| S-04 | Alta | Login sem *rate limit* (força bruta) e sem regra `email`. | `RateLimiter::for('login', fn ($r) => Limit::perMinute(5)->by($r->input('email').$r->ip()))`. |
| S-05 | Alta | Não existe logout no servidor; o front apaga só o `localStorage` e o token continua válido por 120 min. | `POST /auth/logout` → `$request->user()->currentAccessToken()->delete()`. |
| S-06 | Alta | Cadastro sem `unique:email`, sem política de senha e sem verificação de e-mail. | `Password::defaults()` no `AppServiceProvider`, `MustVerifyEmail`. |
| S-07 | Média | Token em `localStorage` fica exposto a qualquer XSS. | Como front e API ficam no mesmo domínio-raiz, preferir **Sanctum SPA (cookie HttpOnly + CSRF)**: `statefulApi()` em `bootstrap/app.php`, `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`, `axios.defaults.withCredentials = true` e `withXSRFToken`. Manter *tokens* apenas para mobile e API pública (com *abilities*). |
| S-08 | Média | Sem `config/cors.php` (default `*`). | Publicar (`php artisan config:publish cors`) e restringir `allowed_origins` ao domínio do front em produção, com `supports_credentials=true` se usar cookie. |
| S-09 | Média | Erros 500 expõem *stack trace* se `APP_DEBUG=true` em produção. | `.env.production` com `APP_DEBUG=false`, `LOG_LEVEL=warning`; healthcheck `/up`. |
| S-10 | Baixa | Validações sem `max` (payloads gigantes) e `orderBy`/filtros futuros vindos da query string. | `max:` em toda string; *whitelist* de colunas ordenáveis (`Rule::in([...])`) ou `spatie/laravel-query-builder` (`allowedSorts`/`allowedFilters`). |

**Injeção e XSS:** hoje não há SQL cru, e o Eloquent usa *bindings*, então o risco é baixo. Mantenha `DB::raw`/`whereRaw` sempre com `?`. No React, o JSX escapa por padrão. Os três `dangerouslySetInnerHTML` atuais só injetam CSS estático (são seguros, mas devem sair). Para conteúdo rico futuro (notícias, fórum, descrições de modelos), use **Markdown** renderizado com `react-markdown` (sem `rehype-raw`) ou sanitize com **DOMPurify** no front e `mews/purifier` no back. Adicione cabeçalhos `Content-Security-Policy`, `X-Content-Type-Options: nosniff` e `Referrer-Policy` no servidor web (ou `bepsvpt/secure-headers`).

### 5.2 Uploads (STL, 3MF, fotos, laudos)

| Etapa | STL / 3MF | Laudos (PDF) | Fotos |
| :--- | :--- | :--- | :--- |
| Validação síncrona (FormRequest) | `File::types(['stl','3mf'])->max(50 * 1024)` + **Rule customizada por *magic bytes***: STL binário: `84 + 50 × nTriângulos === filesize`; STL ASCII: começa com `solid` e contém `facet`. 3MF: assinatura ZIP `PK\x03\x04` e `ZipArchive` contendo `3D/3dmodel.model` e `[Content_Types].xml`. | `mimetypes:application/pdf`, `max:10240`, assinatura `%PDF-` | `File::image()->max(5 * 1024)->dimensions(max_width=6000)` |
| Proteções | Limite de tamanho descompactado do 3MF (zip bomb: somar `statIndex()['size']`, rejeitar acima de 200 MB e taxa de compressão acima de 100×); parse XML com `LIBXML_NONET` (sem entidades externas/XXE) | Rejeitar PDF com JavaScript/`/Launch` (opcional: reprocessar com `qpdf`) | Reencodar com **Intervention Image** (remove EXIF/GPS, que é privacidade!) e gerar WebP + *thumbnails* |
| Armazenamento | Disco **privado** (`local` em dev, S3/MinIO em prod), nome = UUID, nunca o original; `sha256` para deduplicar | idem | Disco público + CDN |
| Processamento assíncrono (*job*) | Antivírus (**ClamAV** via `clamd`); cálculo de volume (soma de volumes de tetraedros assinados), *bounding box* e nº de triângulos → `anexos.metadados` (alimenta o orçamento); geração de *thumbnail* (`stl-thumb` CLI) | Antivírus; status `pendente → aprovado` só após scan e revisão humana | — |
| Download | `Storage::temporaryUrl()` ou rota com `URL::signedRoute` expirando em 5 min; *throttle*; contagem em `downloads` | Só para o dono, o laboratório emissor e quem consulta o lote | — |
| Infra | `upload_max_filesize=64M`, `post_max_size=70M` no PHP; `client_max_body_size 70m` no Nginx; upload em *chunks* (tus/Uppy) se passar de 50 MB | | |

`spatie/laravel-medialibrary` resolve armazenamento, conversões, coleções por model e URLs temporárias, e encaixa na tabela `anexos`/`media`.

### 5.3 Performance do backend
- **Paginação** em todos os `index` (`->paginate(20)` ou `cursorPaginate` para feeds) + **API Resources**.
- **Eager loading** e `Model::shouldBeStrict(! app()->isProduction())` para pegar N+1, atributos inexistentes e *mass assignment* silencioso.
- **Índices** em todas as FKs (o `constrained()` já cria), em `status`, `(uf,cidade)`, `(latitude,longitude)` e FULLTEXT nos textos buscáveis.
- **Cache:** `Cache::flexible()` / `remember()` para catálogos (polímeros, licenças, áreas, especialidades: TTL de 24 h, invalidação no Observer); painel de impacto e ranking pré-calculados por *job* (`metricas_impacto_diarias`) e cacheados por 10 min; contadores (`downloads_count`) via `increment` e não `count()`.
- **Redis** para cache, filas e *rate limit* em produção (`CACHE_STORE=redis`, `QUEUE_CONNECTION=redis`) + **Laravel Horizon** para monitorar filas.
- **Filas** para tudo que é lento: e-mails, notificações, análise de arquivos, geocodificação, agregações.
- **Busca:** Laravel Scout + Meilisearch (ou o driver `database` no início) para o repositório de modelos e talentos.
- Opcional, mais tarde: Laravel Octane (FrankenPHP).

### 5.4 Performance do frontend
- Vite + **code splitting por rota** (`lazy()`), com o visualizador 3D (three.js, cerca de 600 kB) e o mapa (Leaflet) carregados só nas páginas que usam.
- Remover MUI e Emotion (lucide-react + Radix), o que reduz bastante o bundle inicial.
- TanStack Query com `staleTime` coerente (catálogos 1 h, listas 30 s), `placeholderData: keepPreviousData` na paginação e *prefetch* no hover dos cards.
- Imagens `loading="lazy"`, `srcset` com os WebP gerados no back; fontes auto-hospedadas (`@fontsource/inter`) com `font-display: swap`.
- Listas longas (mapa, ranking, mensagens) com `@tanstack/react-virtual`.
- Medir com Lighthouse CI e `rollup-plugin-visualizer`.

---

## 6. Skills, plugins e ferramentas

### 6.1 Bibliotecas recomendadas

**Backend (Composer)**
| Pacote | Uso |
| :--- | :--- |
| `spatie/laravel-permission` | Papéis (maker, laboratório, escola, empresa, moderador, admin) |
| `spatie/laravel-medialibrary` | Uploads, coleções, conversões, URLs temporárias |
| `spatie/laravel-query-builder` | Filtros, ordenação e *includes* seguros via query string |
| `spatie/laravel-model-states` | Máquinas de estado (doação, coleta, pedido, orçamento) |
| `spatie/laravel-activitylog` | Auditoria (moderação, laudos, rastreabilidade) |
| `laravel/scout` + `meilisearch/meilisearch-php` | Busca no repositório e em talentos |
| `laravel/horizon` | Painel de filas (Redis) |
| `simplesoftwareio/simple-qrcode` | QR Code dos lotes |
| `intervention/image` | Tratamento de fotos (remoção de EXIF, WebP) |
| `filament/filament` (v4) | Painel administrativo e de moderação pronto |
| `dedoc/scramble` | Documentação OpenAPI automática da API (base para a API pública e para gerar o cliente do front) |
| `kitloong/laravel-migrations-generator` (dev) | **Gerar migrations do banco atual (D-01)** |
| `larastan/larastan` (dev) | Análise estática (PHPStan nível 5→8) |
| `laravel/telescope` (dev) | Depurar requests, queries e jobs |
| `barryvdh/laravel-ide-helper` (dev) | Autocomplete de models e facades |

**Frontend (npm)**
| Pacote | Uso |
| :--- | :--- |
| `vite`, `@vitejs/plugin-react` | Substituir CRA |
| `@tanstack/react-query` (+ devtools) | Estado de servidor e cache |
| `axios` ou `ky` | apiClient com interceptors |
| `react-hook-form` + `zod` + `@hookform/resolvers` | Formulários e validação |
| `lucide-react`, `@radix-ui/*` ou `shadcn/ui` | Ícones e componentes acessíveis (substituem o MUI) |
| `clsx` + `tailwind-merge` | Composição de classes |
| `@react-three/fiber` + `@react-three/drei` | Visualizador STL/3MF |
| `react-leaflet` + `leaflet.markercluster` | Mapa interativo (OpenStreetMap, sem custo) |
| `qrcode.react` / `@yudiel/react-qr-scanner` | Exibir e ler QR Code |
| `recharts` | Painel de impacto |
| `sonner` | Toasts |
| `date-fns` | Datas pt-BR |
| `vitest` + `@testing-library/react` + `msw` | Testes unitários e de integração com API mockada |
| `@playwright/test` | E2E (fluxo doação → coleta → lote) |
| `eslint` (flat config) + `eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y` + `prettier` + `prettier-plugin-tailwindcss` | Qualidade e ordenação de classes |
| `vite-plugin-pwa` | PWA (cobre boa parte do "app mobile" antes de um app nativo) |

### 6.2 Extensões do VS Code
- **PHP:** *PHP Intelephense*, *Laravel* (oficial, da Laravel), *Laravel Pint*, *PHPStan*, *Pest* / *Better Pest*, *DotENV*.
- **Front:** *ESLint*, *Prettier*, *Tailwind CSS IntelliSense*, *ES7+ React snippets*, *Vitest*, *Playwright Test for VS Code*.
- **Geral:** *EditorConfig*, *GitLens*, *Error Lens*, *Thunder Client* ou *REST Client* (coleção de requests versionada em `docs/api.http`), *Docker*, *Mermaid Preview* (diagramas ER no repositório), *Code Spell Checker* + dicionário **Portuguese (Brazilian)**.

### 6.3 Integração contínua (GitHub Actions)
`.github/workflows/ci.yml` com dois jobs em paralelo:
- **backend:** `shivammathur/setup-php@v2` (PHP **8.4**, alinhado ao lock) → `composer install` → `vendor/bin/pint --test` → `vendor/bin/phpstan analyse` → `php artisan test --parallel` (SQLite em memória, depois MySQL em *service container*).
- **frontend:** `actions/setup-node@v4` (Node 22) → `npm ci` → `npm run lint` → `npm run test -- --run` → `npm run build`.

Complementos: Dependabot (composer + npm + actions), *branch protection* exigindo CI verde e, opcionalmente, o workflow do **Claude Code GitHub Action** para revisão automática de PRs.

### 6.4 Configuração para acelerar o trabalho com o Claude
1. **`CLAUDE.md` na raiz** (`/init` gera a base). Inclua: stack e versões (PHP 8.4, Laravel 13, React 19/Vite), comandos (`composer test`, `npm run test`, `pint`), convenções (nomes em português, `usuario_id`, Actions, Policies, Resources, `features/`), regras ("nunca aceitar `usuario_id` do cliente", "toda rota de escrita com `auth:sanctum` e Policy", "toda migration com FK `constrained()`"). Coloque `backend/CLAUDE.md` e `frontend/CLAUDE.md` específicos. O `backend/AGENTS.md` do Boost pode ser referenciado no `CLAUDE.md`.
2. **Laravel Boost para Claude Code:** o Boost hoje está configurado só para o Junie (`boost.json` → `"agents": ["junie"]`, com caminho Windows). Rode `php artisan boost:install`, selecione **Claude Code** e ele gera `.mcp.json` e as *guidelines*. O MCP `laravel-boost` dá ao Claude acesso a `database-schema`, `list-routes`, `tinker`, `last-error`, `read-log-entries` e `search-docs` (docs da versão exata instalada), o que é muito útil para gerar migrations e Policies corretas.
3. **Skills de projeto** em `.claude/skills/` (as do `.junie/skills` podem ser copiadas). Sugestões:
   - `novo-modulo-laravel`: *checklist* que gera migration + model + enum + factory + policy + requests + resource + controller + rotas + teste Pest.
   - `nova-feature-react`: gera `features/<x>/{api.js, hooks, pages, components, schemas}` com padrão TanStack Query + RHF/Zod.
   - `upload-seguro`: regras de §5.2.
4. **Hooks** (`.claude/settings.json`, via `/update-config`): `PostToolUse` em `*.php` → `vendor/bin/pint --dirty`; em `*.jsx` → `npx prettier --write`. `SessionStart` (para sessões na nuvem): `composer install && npm ci` (a skill `session-start-hook` gera isso).
5. **MCPs úteis:**
   - **Laravel Boost** (acima).
   - **Figma MCP** (já disponível neste ambiente): o protótipo de alta fidelidade está no Figma, então dá para pedir "implemente a tela X a partir deste link do Figma" usando os componentes de `shared/ui`.
   - **GitHub MCP**: issues e PRs por módulo, revisão.
   - **Playwright MCP**: o Claude abre o front, navega e valida o fluxo real.
   - **MySQL/Postgres MCP** (somente leitura) para o banco local, se não usar o `database-query` do Boost.
   - **Context7**: documentação atualizada de bibliotecas (React Query, react-three-fiber, Leaflet).
6. **Fluxo de trabalho:** um módulo por sessão/branch. Use o modo *plan* para desenhar migration e endpoints antes de codar, peça os testes Pest primeiro (TDD) e use `/code-review` e `/security-review` antes de cada PR.

---

## Apêndice — Checklist de correções imediatas (sprint 0)

- [ ] Alinhar PHP: `composer.json` → `"php": "^8.4"`; atualizar o README (PHP 8.4, `php artisan serve`, `npm run dev` após Vite).
- [ ] Gerar migrations do banco atual (`migrate:generate`) + migrations padrão (`sessions`, `jobs`, `password_reset_tokens`, `notifications`).
- [ ] Corrigir `ProjetoController`/`ProjetoFactory` (`use App\Models\Projeto;`).
- [ ] Remover `User`/`UserFactory`; corrigir `DatabaseSeeder` e as factories.
- [ ] `routes/api.php`: grupo `auth:sanctum`, `apiResource`, rotas `minhas`/`porVaga`/`logout`, *throttle* no login.
- [ ] Policies para Vaga, Candidatura, Noticia, Projeto, Chamado, Curriculo, Usuario.
- [ ] Remover `GET /usuario` público; `PATCH/DELETE /me`.
- [ ] API Resources + paginação.
- [ ] Testes Pest de autorização (403/401) para cada rota de escrita.
- [ ] Frontend: Vite, `.env`, `apiClient`, `AuthProvider`, remover arquivos vazios, corrigir `CadastroVaga.jsx`, rota `/login`, rotas com `:id`.
- [ ] CI no GitHub Actions.
