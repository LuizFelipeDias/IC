# EcoHub 3D — Relatório técnico: diagnóstico, banco de dados, permissões e roadmap

> **Versão 2 (outubro/2026).** Substitui a versão 1, que está no histórico do Git (commit `c64fded`).
> **Artefatos analisados:** repositório (branch `claude/ecstatic-noether-5miksl`), *Requisitos Plataforma Eco Hub 3d — Adapta One (outubro/2026)* e o script DDL PostgreSQL do banco em uso (`script.sql`).
> **Como foi verificado:**
> - O DDL foi carregado num PostgreSQL 16 e comparado com o esquema gerado pelas migrations (diff de `information_schema` e `pg_constraint`): **idêntico em 103 itens** (colunas, tipos, defaults, identity, constraints, FKs e triggers).
> - As migrations novas rodaram sobre uma **cópia do banco legado com dados**, sem perda de registros.
> - A suíte de testes (**73 testes de API**, 281 asserções) passa em **PostgreSQL e SQLite**; o frontend tem 12 testes Vitest.
> - Os fluxos de cada perfil foram percorridos num navegador real (Chromium headless).

---

## Sumário executivo

| Indicador | Commit inicial (`2ba4c42`) | Agora |
| :--- | :--- | :--- |
| Rotas de API protegidas por autenticação | 1 de 25 | 44 de 55 (as 11 públicas são login, cadastro, leitura de vagas/notícias/projetos/reações, ranking e rastreio) |
| Controle de acesso por perfil | Inexistente (só triggers no banco) | Middleware `perfil` + 6 Policies (sobre 2 bases abstratas) + CHECKs/triggers no banco |
| Esquema versionado em migrations | 2 tabelas de infraestrutura | 18 migrations; esquema legado reproduzido 1:1 e evoluído sem perda de dados |
| Testes automatizados | 0 | 73 (API, PostgreSQL e SQLite) + 12 (frontend) + CI |
| Módulos dos requisitos com backend | ~1,5 de 6 | 4,5 de 6 (ver §2.3) |
| Funcionalidades sugeridas com base de dados | 0 | Rastreabilidade (QR), laudos, gamificação e moderação |

**Riscos que continuam abertos** (detalhados em §7):
- não há upload de arquivos STL/3MF nem dos PDFs de laudo;
- as mensagens de validação estão em inglês;
- doações, coletas e lotes já têm tabelas, mas ainda não têm endpoints de cadastro;
- empresas não são verificadas (qualquer um pode se declarar empresa);
- usuários legados sem e-mail não conseguem fazer login.

---

## 1. Diagnóstico do código e funções cumpridas

### 1.1 Saúde geral

| Dimensão | Avaliação | Comentário |
| :--- | :---: | :--- |
| Segurança de acesso | 🟢 | Todas as escritas exigem token e passam por perfil e por Policy; dados pessoais saem só para o próprio usuário. |
| Integridade de dados | 🟢 | CHECKs, FKs com `ON DELETE` definido, UNIQUEs e triggers no PostgreSQL; validação espelhada nos FormRequests. |
| Testabilidade | 🟢 | Factories com estados por perfil (`escola()`, `laboratorio()`, `prestador()`, `moderador()`), CI em dois bancos. |
| Consistência de API | 🟡 | Resources, paginação e 204/422/403/409 padronizados; ainda sem versionamento (`/api/v1`) nem documentação OpenAPI. |
| Frontend | 🟡 | Login, cadastro, home, vagas e chamados integrados à API; notícias, projetos e currículo ainda usam dados fixos. |
| Cobertura dos requisitos | 🟡 | Ver §2.3. |

### 1.2 Funções, rotas e regras de negócio operacionais

Todas as linhas abaixo têm teste automatizado em `backend/tests/Feature/Api/`.

#### Autenticação e conta
| Rota | Acesso | Regra de negócio |
| :--- | :--- | :--- |
| `POST /api/usuario` | público, 6/min por IP | Cadastro com `tipo_usuario` (pessoa física, empresa, escola, laboratório). Deriva `estudante`/`empresa` exigidos pelo banco. Pessoa física: CPF, sexo e profissão obrigatórios. PJ: CNPJ. Escola: código INEP (8 dígitos). E-mail único, senha forte. Devolve o token (auto-login). |
| `POST /api/login` | público, 5/min por e-mail+IP | Verifica a senha com hash e emite token Sanctum de 120 min. |
| `POST /api/logout` | autenticado | Revoga o token no servidor. |
| `GET/PATCH/DELETE /api/usuario/me` | autenticado | Dados completos e **mapa de perfis** do próprio usuário. Trocar a senha exige a atual. Tipo e papel não mudam depois do cadastro. Excluir a conta remove tokens e vagas e mantém notícias e projetos sem autor. |
| `GET /api/usuario/{id}` | autenticado | Perfil público, sem CPF, CNPJ, e-mail ou telefone. |

#### Vagas e candidaturas (banco de currículos)
| Rota | Acesso | Regra |
| :--- | :--- | :--- |
| `GET /api/vaga`, `/vaga/{id}` | público | Lista paginada (`?per_page`, máx. 100). |
| `POST/PUT/DELETE /api/vaga` | **contratante** (PJ) | Autor vem do token; só o autor altera ou exclui. O trigger `trg_bloquear_estudante_vaga` repete a regra no banco. |
| `GET /api/vaga/minhas`, `/vaga/{id}/candidaturas` | contratante, dono | Painel do empregador. |
| `POST/GET/DELETE /api/candidatura` | **candidato** (PF) | Uma candidatura por vaga (`candidatura_unica`); começa "Em análise"; só o candidato desiste. |
| `PATCH /api/candidatura/{id}` | contratante, dono da vaga | Muda o status (Em análise, Aprovada, Reprovada, Cancelada). |
| `GET/POST/PUT/DELETE /api/curriculo` | autenticado | O dono gerencia; empresas consultam o banco de currículos; os demais veem só o próprio. |

#### Chamados (pedidos de escolas públicas e empresas)
| Rota | Acesso | Regra |
| :--- | :--- | :--- |
| `GET /api/chamado`, `/chamado/{id}`, `/chamado/opcoes` | solicitante, prestador, moderador | O solicitante vê os próprios; o prestador vê os **abertos** e os que atende; o moderador vê todos. `opcoes` lista tipos de serviço e **locais de atendimento**. |
| `POST/PUT/DELETE /api/chamado` | **solicitante** (escola, empresa) | Exige tipo de serviço e prazo. Editar e excluir só enquanto está "Aberto". O status nunca é alterado por PATCH. |
| `POST /api/chamado/{id}/aceitar` | **prestador** (laboratório, maker) | Exige o local de atendimento. Transação com `lockForUpdate`: um segundo aceite recebe 409. O solicitante não aceita o próprio chamado. |
| `POST /api/chamado/{id}/concluir` | prestador responsável | Marca como "Resolvido" e concede **50 pontos** e selos. |
| `POST /api/chamado/{id}/cancelar` | solicitante dono | Cancela enquanto está aberto ou em atendimento. |

O contato (e-mail e telefone) do solicitante e do prestador aparece só para os dois, depois do aceite.

#### Notícias, projetos e curadoria
| Rota | Acesso | Regra |
| :--- | :--- | :--- |
| `GET /api/noticia`, `/api/projeto` | público | Só conteúdo **publicado**. Filtros `tema`, `area`, `licenca`, `q`. O moderador pode filtrar por `status`. |
| `GET /api/{noticia|projeto}/{id}` | público / autor / moderador | Rascunho ou rejeitado: só o autor e os moderadores. |
| `GET /api/{noticia|projeto}/minhas` | autenticado | Acompanhamento da revisão. |
| `POST /api/noticia` | **publicador** (PJ ou moderador) | Nasce "em revisão" (a do moderador já nasce publicada). |
| `POST /api/projeto` | autenticado | Área e licença Creative Commons obrigatórias; nasce "em revisão". |
| `PUT/DELETE` | autor ou moderador | Edição do autor volta para revisão. |
| `POST /api/{noticia|projeto}/{id}/moderacao` | **moderador** | Aprovar ou rejeitar com motivo; registra em `moderacoes`. O moderador não modera o próprio conteúdo. Projeto aprovado dá **20 pontos** ao autor. |
| `POST /api/denuncia` · `GET /api/denuncia` · `POST /api/denuncia/{id}/resolver` | autenticado · moderador | Denúncia de conteúdo publicado (peça perigosa, licença violada...). Se procedente, o conteúdo sai do ar. |
| `PUT/DELETE /api/noticia/{id}/reacao` · `GET /api/noticia/{id}/reacoes` | autenticado · público | Uma reação por usuário (curtir, útil, inspirador) com comentário. Usa a tabela legada `reacoes_noticias`. |

#### Economia circular e engajamento
| Rota | Acesso | Regra |
| :--- | :--- | :--- |
| `GET /api/rastreio/{codigo}` | público, 60/min | Página do **QR Code**: polímero, dados técnicos, laboratório, origem agregada (doações, peso reciclado, tipos, cidades), linha do tempo e laudos, **sem dados pessoais**. Código ULID não enumerável. |
| `GET /api/ranking?tipo=` | público | Top 20 por pontos, com selos e sem contato. |

### 1.3 Padrões de código em uso

| Camada | Padrão |
| :--- | :--- |
| Rotas | `routes/api.php` agrupado por **perfil** (`middleware('perfil:...')`), padrões numéricos globais para `{id}`. |
| Autorização | Duas camadas: o **middleware** `GarantePerfil` decide *quem pode usar a rota*; as **Policies** decidem *sobre qual registro* (dono, status). A regra de cada perfil fica num lugar só: `Usuario::temPerfil()`. |
| Validação | FormRequest por entidade com regras `required/sometimes` conforme o método; `prepareForValidation` normaliza (UF, booleanos derivados). |
| Domínio | **Enums** PHP para todo valor fechado (`TipoUsuario`, `Perfil`, `StatusChamado`, `LocalAtendimento`...), espelhados por CHECK no banco. |
| Regras transversais | **Services** (`ModeracaoService`, `GamificacaoService`) e o trait `Moderavel`. |
| Respostas | API Resources; perfil público e privado separados; `JsonResource::withoutWrapping()`. |
| Banco | Nomes em português, FK `id_<entidade>` (convenção do DDL original mantida), constraints com nome explícito, `NOT VALID` para não rejeitar dados legados. |
| Frontend | `services/api.js` (cliente único), `AuthContext` com `pode(...perfis)`, `RequirePerfil` para rotas, páginas com *lazy loading*. |

### 1.4 Dívidas técnicas e inconsistências que permanecem

| Severidade | Dívida | Encaminhamento |
| :---: | :--- | :--- |
| Alta | Sem upload de STL/3MF e de PDFs de laudo (§7.2). | Próximo commit planejado (§6.2). |
| Alta | Doações, coletas, lotes e laudos não têm endpoints de escrita; o rastreio já lê. | §6.2. |
| Média | Mensagens de validação em inglês. | `laravel-lang/lang` ou `lang/pt_BR/validation.php`. |
| Média | Telas de Notícias, Projetos, Currículo e Visualização usam dados fixos. | Ligar à API já existente (`/noticia`, `/projeto`, `/curriculo`). |
| Média | Qualquer pessoa pode se cadastrar como empresa ou laboratório e ganhar os perfis correspondentes. | Verificação de CNPJ/INEP (consulta à Receita/INEP ou aprovação por moderador) antes de liberar os perfis. |
| Média | Usuários legados com `email` nulo não conseguem logar. | `SELECT id, nome FROM usuario WHERE email IS NULL;` e completar manualmente. |
| Baixa | Convenção mista de nomes de tabela (`usuario`/`curriculo` no singular, demais no plural). | Mantida para não quebrar o banco em uso; renomear só numa janela de manutenção. |
| Baixa | MUI e Emotion convivem com Tailwind; alguns `<style dangerouslySetInnerHTML>` restantes. | Trocar por Tailwind + lucide-react/Radix. |
| Baixa | API sem versionamento e sem OpenAPI. | `dedoc/scramble` + prefixo `/api/v1` quando houver cliente externo (app mobile). |

---

## 2. Banco de dados atual × requisitos

### 2.1 Avaliação do DDL enviado (`script.sql`)

**Pontos fortes**
- `chk_tipo_usuario` e `chk_dados_consistentes`: o banco garante que pessoa física tem CPF, sexo e profissão e que empresa tem CNPJ. Essa é a melhor regra de integridade do projeto, e o código foi alinhado a ela.
- `candidatura_unica` e o `UNIQUE` de `reacoes_noticias` evitam duplicidade.
- Os triggers `trg_bloquear_estudante_vaga` e `trg_bloquear_empresa_candidatura` funcionam como última barreira de regra de negócio.
- `generated always as identity` e `timestamptz` nas datas de negócio.

**Problemas encontrados (e o que foi feito)**

| # | Problema no DDL | Impacto | Situação |
| :-: | :--- | :--- | :--- |
| B1 | `usuario.email` é **nulo e não único**. | Login ambíguo ou impossível. | ✅ `UNIQUE` adicionado (`usuario_email_key`); o app exige o e-mail. Nulos legados continuam (ver §1.4). |
| B2 | As funções `verificar_criador_vaga()` e `verificar_candidato_estudante()` **não estão no script**. | Restaurar o banco a partir do script falha. | ✅ Recriadas na migration de linha de base (só em bancos novos). |
| B3 | FKs de `noticias`, `projetos` e `vagas` **sem `ON DELETE`**. | Excluir a conta de quem publicou dava erro 500. | ✅ `CASCADE` para vagas, `SET NULL` para notícias e projetos. |
| B4 | **Nenhum índice em colunas de FK** (o PostgreSQL não cria sozinho). | Varredura completa em "minhas vagas" e "meus chamados" e em cascatas. | ✅ Índices adicionados. |
| B5 | `status` em `chamados` e `candidaturas` é `varchar` livre. | Valores inválidos (ex.: "Pendente"). | ✅ CHECK em `chamados` (`NOT VALID` preserva o legado). Candidaturas: validado na API; CHECK pendente. |
| B6 | Não há como representar **escola**, **laboratório**, **maker/voluntário** nem **moderador**. | Impossível aplicar as regras de permissão pedidas. | ✅ `tipo_usuario`, `prestador_servico`, `papel`, `codigo_inep` + CHECKs. |
| B7 | `reacoes_noticias` e `anexos_documentos` existiam **sem código**. | Funcionalidade morta. | ✅ Reações com endpoint; anexos ganharam metadados e servem aos laudos. |
| B8 | `vagas` e `curriculo` têm `created_at/updated_at`, mas os models diziam que não. | Datas sempre nulas. | ✅ Models corrigidos. |
| B9 | Mistura de `timestamp` (sem fuso) e `timestamptz`. | Datas ambíguas entre servidores. | Mantido nas colunas legadas; todas as novas usam `timestamptz`. |

### 2.2 Tabelas adicionadas nesta etapa

```mermaid
erDiagram
    usuario ||--o{ chamados : "abre (id_usuario)"
    usuario ||--o{ chamados : "atende (id_prestador)"
    usuario ||--o{ doacoes : doa
    doacoes ||--o{ solicitacoes_coleta : "é solicitada"
    usuario ||--o{ solicitacoes_coleta : "laboratório recebe"
    solicitacoes_coleta ||--o{ lote_origens : compõe
    lotes_filamento ||--o{ lote_origens : "tem origem"
    lotes_filamento ||--o{ lote_eventos : "linha do tempo"
    lotes_filamento ||--o{ laudos_qualidade : "é avaliado"
    anexos_documentos |o--o{ laudos_qualidade : "PDF do laudo"
    polimeros ||--o{ doacoes : ""
    polimeros ||--o{ lotes_filamento : ""
    usuario ||--o{ pontuacoes : ganha
    selos ||--o{ selos_usuario : ""
    usuario ||--o{ selos_usuario : conquista
    usuario ||--o{ denuncias : denuncia
    usuario ||--o{ moderacoes : decide
```

| Funcionalidade | Tabelas e colunas | Constraints e relacionamentos principais |
| :--- | :--- | :--- |
| **Perfis (RBAC)** | `usuario` + `tipo_usuario`, `prestador_servico`, `papel`, `codigo_inep`, `remember_token`, `pontos_total` | `chk_tipo_usuario_valido`, `chk_tipo_usuario_documento` (`(tipo='pessoa_fisica') = estudante`), `chk_prestador_pessoa_fisica`, `chk_papel_valido`; UNIQUE `email`, `codigo_inep` |
| **Chamados** | `chamados` + `tipo_servico`, `cidade`, `uf`, `id_prestador`, `local_atendimento`, `aceito_em`, `concluido_em` | FK `id_prestador → usuario ON DELETE SET NULL`; CHECKs de status, tipo, local, `id_prestador <> id_usuario` e "em atendimento exige prestador e local" |
| **Doações (módulo 1)** | `polimeros` (catálogo PLA, PETG, ABS, PET, TPU, PP), `doacoes` | FK doador `CASCADE`, polímero `RESTRICT`; CHECK de tipo, status e peso > 0; índice em (lat, long) |
| **Coleta (módulo 2)** | `solicitacoes_coleta` | **Índice único parcial**: uma solicitação ativa por doação; CHECK de modalidade, status e peso |
| **Rastreabilidade (QR)** | `lotes_filamento` (`codigo` ULID), `lote_origens`, `lote_eventos` | UNIQUE `codigo`; `peso_saida ≤ peso_entrada`; UNIQUE (lote, coleta); eventos com tipo controlado |
| **Controle de qualidade** | `laudos_qualidade`; `anexos_documentos` + `mime`, `tamanho_bytes`, `sha256`, `disco`, `status_verificacao` | FK lote `CASCADE`, laboratório, responsável, anexo `SET NULL`; CHECK de resultado, medidas > 0 e faixa de temperatura |
| **Gamificação** | `pontuacoes` (histórico imutável), `selos`, `selos_usuario` | **UNIQUE (usuário, ação, origem)**, o que torna a concessão idempotente; PK composta em `selos_usuario` |
| **Moderação** | `noticias`/`projetos` + `status`, `motivo_rejeicao`, `id_moderador`, `moderado_em`; `projetos` + `area`, `licenca`; `moderacoes`, `denuncias` | CHECK de status, área, licença CC e motivo; UNIQUE (denunciante, conteúdo); índice (status, data_publicacao) |

### 2.3 Cobertura dos 6 módulos

| Módulo | Banco | API | Tela | O que falta |
| :--- | :---: | :---: | :---: | :--- |
| 1. Doação de makers | ✅ | ❌ | ❌ | CRUD de doações com fotos e geolocalização do CEP. |
| 2. Receptores e reciclagem | ✅ | 🟡 (rastreio) | ❌ | Polímeros aceitos e capacidade por laboratório (`laboratorio_polimeros`), fluxo de solicitação e agendamento, criação de lotes e eventos. |
| 3. Repositório de projetos | 🟡 | 🟡 | ❌ | Arquivos STL/3MF com validação, instruções de impressão (`jsonb`), visualizador 3D. |
| 4. Pedidos de escolas | ✅ | ✅ | ✅ | Índice de vulnerabilidade (INSE/IDEB pelo INEP) para priorizar, sugestão automática de prestadores. |
| 5. Banco de currículos | 🟡 | ✅ | 🟡 | Especialidades estruturadas, portfólio de peças, busca por filtros. |
| 6. Hub de conexão | ❌ | ❌ | ❌ | `anuncios` (demanda/oferta), `anuncio_interesses`, mensagens e notificações. |

**Funcionalidades sugeridas ainda sem tabela:**
- marketplace: `impressoras`, `orcamentos`, `pedidos_servico`, `avaliacoes`;
- mapa: coluna `geography(Point)` com PostGIS e índice GiST;
- eventos: `eventos` e `inscricoes_evento`;
- fórum: `forum_topicos` e `forum_respostas`;
- integrações: `integracoes_externas`;
- mobile: `dispositivos` (tokens de push).

As colunas detalhadas estão na versão 1 deste relatório.

---

## 3. Backend e frontend

### 3.1 Backend (Laravel 13)

| Elemento | Situação | Qualidade |
| :--- | :--- | :---: |
| **Controllers** (12) | Finos: validam, autorizam (`Gate::authorize`) e delegam. As regras transversais ficam nos Services. `ChamadoController::aceitar` trata concorrência com lock pessimista. | 🟢 |
| **Models** (18) | Relacionamentos completos, enums com cast, `$attributes` com os defaults do banco, trait `Moderavel`, *scopes* (`visiveisPara`, `publicados`). `Model::shouldBeStrict()` em desenvolvimento. | 🟢 |
| **Requests** (7) | Espelham as constraints do banco (CPF/CNPJ/INEP condicionais, enums, `after_or_equal:today`). `CandidaturaController` e `CurriculoController` ainda validam inline em parte. | 🟢 |
| **Migrations** (18) | Linha de base idempotente que reproduz o DDL; evoluções com `down()` testado (rollback/migrate); CHECKs só no PostgreSQL. | 🟢 |
| **Rotas** | API agrupada por perfil; web só com `/` e `/up`. Falta versionamento `/api/v1`. | 🟡 |
| **Resources** (9) | Perfil público e privado separados; contato condicionado ao envolvimento; rastreio sem dados pessoais. | 🟢 |

### 3.2 Frontend (React 19 + Vite + Tailwind)

| Aspecto | Situação | Próximo passo |
| :--- | :--- | :--- |
| Componentização | `Nav`, `Footer`, `RequirePerfil`; páginas novas (`Chamados`, `CadastroVaga`) com subcomponentes locais. Páginas antigas ainda monolíticas (300–600 linhas). | Extrair `shared/ui` (Button, Input, Select, Badge, Card, EmptyState). |
| Estado | `AuthContext` com usuário, perfis e `pode()`; estado de servidor com `useState`/`useEffect`. | TanStack Query para cache e revalidação. |
| Consumo da API | Cliente único `services/api.js` (token, 401 encerra a sessão, 422 por campo, erro de rede). Sem URL fixa no código. | Gerar o cliente a partir do OpenAPI. |
| Tailwind | Cor de marca como *token* (`brand`); páginas novas sem CSS injetado. | Remover MUI/Emotion e os `<style>` restantes. |
| Páginas e rotas | Rotas em minúsculas, *lazy loading* (bundle inicial de 243 kB), 404 → login, guardas por perfil. | Rotas de detalhe com `:id` (`/noticias/:id`). |

---

## 4. Lacunas e lógica de permissões (RBAC)

### 4.1 Modelo

- **Tipo de usuário** (`tipo_usuario`, escolhido no cadastro e imutável): `pessoa_fisica`, `empresa`, `escola`, `laboratorio`. Os booleanos legados continuam: `estudante` = pessoa física e `empresa` = pessoa jurídica.
- **Atributo de pessoa física:** `prestador_servico` (maker/voluntário), que a própria pessoa liga e desliga.
- **Papel administrativo** (`papel`): `usuario`, `moderador`, `admin`. Só muda direto no banco ou por um admin.
- **Perfis de acesso** (enum `Perfil`), calculados em `Usuario::temPerfil()`:

| Perfil | Quem tem | O que libera |
| :--- | :--- | :--- |
| `solicitante` | escola, empresa ("Escola" ou "CNPJ") | criar e acompanhar chamados |
| `prestador` | laboratório; pessoa física com `prestador_servico` | ver chamados abertos, **escolher o local de atendimento**, aceitar e concluir |
| `contratante` | empresa, escola, laboratório ("CNPJ/Instituição") | publicar vagas e gerir candidatos |
| `candidato` | pessoa física | candidatar-se a vagas |
| `publicador` | pessoa jurídica ou moderador | publicar notícias (sujeitas a moderação) |
| `moderador` | `papel` moderador ou admin | aprovar e rejeitar conteúdo, resolver denúncias, ver todos os chamados |

### 4.2 Matriz de permissões

| Ação | PF | PF maker | Empresa | Escola | Laboratório | Moderador | Visitante |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Abrir e ver os próprios chamados | | | ✅ | ✅ | | (vê todos) | |
| Ver chamados abertos, escolher local, aceitar | | ✅ | | | ✅ | | |
| Concluir chamado | | responsável | | | responsável | | |
| Publicar vaga e ver candidatos | | | ✅ | ✅ | ✅ | | |
| Candidatar-se | ✅ | ✅ | | | | | |
| Publicar notícia (em revisão) | | | ✅ | ✅ | ✅ | ✅ (publica direto) | |
| Submeter projeto (em revisão) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| Ver notícia ou projeto publicado | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver rascunho ou rejeitado | autor | autor | autor | autor | autor | ✅ | |
| Editar ou excluir notícia/projeto | autor | autor | autor | autor | autor | ✅ | |
| Moderar e resolver denúncias | | | | | | ✅ (exceto o próprio) | |
| Consultar banco de currículos | o próprio | o próprio | ✅ | o próprio | o próprio | o próprio | |
| Rastreio por QR Code e ranking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 4.3 Onde cada regra é aplicada (defesa em camadas)

1. **Front** (`RequirePerfil`, `pode()`): esconde o que o usuário não pode fazer. É só experiência de uso, não segurança.
2. **Middleware `perfil`**: devolve 403 antes do controller.
3. **Policy**: regra sobre o registro (dono, status "Aberto", moderador não modera o próprio).
4. **Banco**: CHECKs (`chk_prestador_pessoa_fisica`, `chk_chamados_prestador_diferente`...) e triggers legados.

> **Decisões a validar com a orientação.** As duas primeiras ficam em `Usuario::temPerfil()` e mudam numa linha.
> - **Laboratório não abre chamados:** "CNPJ", no requisito, foi interpretado como *empresa*.
> - **Escola pode publicar vagas**, por ser instituição com CNPJ.
> - **Notícias exigem moderação** mesmo para instituições.

---

## 5. Estrutura de pastas

### 5.1 Backend — atual (após esta etapa) e evolução

```
backend/app/
├── Enums/                 # valores de domínio (TipoUsuario, Perfil, StatusChamado...) — espelhados por CHECK
├── Http/
│   ├── Controllers/       # finos; um por recurso (+ RastreioController, RankingController invocáveis)
│   ├── Middleware/
│   │   └── GarantePerfil.php   # RBAC por rota: ->middleware('perfil:solicitante,prestador')
│   ├── Requests/          # validação espelhando as constraints do banco
│   └── Resources/         # contrato JSON (público × privado)
├── Models/
│   └── Concerns/          # traits de domínio (Moderavel)
├── Policies/              # regras por registro (dono, status, moderação)
├── Services/              # regras transversais (ModeracaoService, GamificacaoService)
└── Providers/             # rate limiters, morph map, padrões de rota
```

**Próximo passo de escala**, quando os módulos 1, 2 e 6 entrarem (com mais de ~20 controllers):

```
backend/app/
├── Actions/<Modulo>/                # 1 caso de uso por classe (SolicitarColeta, CriarLote, AceitarChamado)
├── Contracts/                       # INTERFACES de fronteira: AnalisadorModelo3D, AntivirusScanner,
│                                    #   Geocodificador, CalculadoraOrcamento, RepositorioExternoModelos
├── Services/<Modulo>/               # implementações (AnalisadorStl, ClamAvScanner, ViaCepGeocodificador)
├── Repositories/                    # só consultas complexas reutilizadas (MapaRepository com PostGIS,
│                                    #   RankingRepository); o Eloquent já cumpre o papel no resto
├── Http/Controllers/Api/V1/<Modulo>/
├── Http/Middleware/                 # GarantePerfil, ForcaJson, RegistraAuditoria
├── Rules/                           # ArquivoStlValido, Arquivo3mfValido, PdfValido, Cpf, Cnpj
├── Events/ Listeners/ Jobs/         # ColetaConcluida -> ConcederPontos; EscanearAnexo; AgregarImpacto
└── Support/                         # utilitários puros (Haversine, formatadores)
routes/api/v1/<modulo>.php
```

### 5.2 Frontend — evolução por feature

```
frontend/src/
├── app/            # router.jsx, providers.jsx, guards/ (RequireAuth, RequirePerfil)
├── features/
│   ├── auth/  chamados/  vagas/  noticias/  projetos/  doacoes/  rastreio/  ranking/
│   │   └── {api.js, hooks/, pages/, components/, schemas.js}
├── shared/
│   ├── components/ui/      # Button, Input, Select, Badge, Card, Modal, EmptyState
│   ├── components/layout/  # AppLayout, Navbar, Footer
│   ├── lib/                # apiClient (o atual services/api.js), queryClient
│   ├── hooks/              # usePermissoes, useDebounce, usePagination
│   └── utils/              # formatadores, enums espelhados do backend
└── styles/
```

---

## 6. Plano de commits

### 6.1 Executados (branch `claude/ecstatic-noether-5miksl`)

| # | Commit | O que entrega |
| :-: | :--- | :--- |
| 1 | `c64fded docs: diagnóstico técnico...` | Relatório v1 |
| 2 | `b580d96 fix(backend): fecha rotas com Sanctum...` | Autenticação, Policies, Resources, 40 testes |
| 3 | `72373c1 fix(backend): impede trocar o perfil...` | Bloqueio de escalada de perfil |
| 4 | `ea31ebc feat(frontend): migra para Vite...` | Vite, cliente de API, AuthProvider |
| 5 | `f20fa3e refactor(db): espelha o DDL PostgreSQL...` | Linha de base 1:1 com o banco real |
| 6 | `96e7ef5 feat(auth): adiciona tipos de usuário e middleware de perfis (RBAC)` | Perfis e middleware |
| 7 | `ef30de0 feat(chamados): fluxo de atendimento com permissões por perfil` | Chamados |
| 8 | `7bbf916 feat(vagas): restringe publicação a contratantes e candidatura a pessoa física` | Vagas |
| 9 | `f4a0a48 fix(db): define ON DELETE nas FKs de autoria...` | Exclusão de conta |
| 10 | `e999afa feat(moderacao): curadoria de notícias e projetos...` | Moderação e denúncias |
| 11 | `1d2b4db feat(noticias): reações e comentários...` | Reações |
| 12 | `be83feb feat(db): adiciona tabelas de rastreabilidade...` | Doações, coletas, lotes |
| 13 | `8aa6820 feat(db): adiciona laudos de controle de qualidade...` | Laudos |
| 14 | `0160bd1 feat(rastreio): endpoint público do QR Code...` | Rastreio |
| 15 | `78ad854 feat(gamificacao): pontos, selos e ranking...` | Gamificação |
| 16 | `9207afe feat(frontend): mostra ações e áreas de acordo com o perfil...` | RBAC no front |
| 17 | `ba89691 feat(frontend): tela de chamados integrada à API...` | Tela de chamados |
| 18 | `ce5ce75 ci: executa os testes do backend também em PostgreSQL 16` | CI em dois bancos |
| 19 | `705ab1f perf(db): indexa as colunas de chave estrangeira...` | Índices |

### 6.2 Próximos commits sugeridos (na ordem)

1. `feat(i18n): traduz mensagens de validação para pt-BR`
2. `feat(uploads): adiciona regras de validação de STL, 3MF e PDF por assinatura de arquivo`
3. `feat(uploads): armazena anexos em disco privado com hash e URL temporária`
4. `feat(jobs): verifica anexos com ClamAV e extrai volume e dimensões de modelos 3D`
5. `feat(doacoes): CRUD de doações com fotos e geolocalização por CEP`
6. `feat(db): adiciona polímeros aceitos e capacidade por laboratório`
7. `feat(coletas): fluxo de solicitação, aceite, agendamento e conclusão de coleta`
8. `feat(lotes): cria lotes a partir de coletas e registra eventos da linha do tempo`
9. `feat(laudos): emissão de laudo com PDF e liberação do lote`
10. `feat(frontend): página pública de rastreio com leitura de QR Code`
11. `feat(gamificacao): pontua coletas concluídas e doações entregues`
12. `feat(frontend): integra notícias, projetos e currículo à API`
13. `feat(auth): verificação de CNPJ/INEP antes de liberar perfis institucionais`
14. `feat(db): adiciona PostGIS e consulta por raio para o mapa interativo`
15. `feat(hub): mural de demandas e ofertas com manifestação de interesse`
16. `feat(marketplace): perfis de impressoras, orçamento automático e avaliações`
17. `feat(impacto): agrega métricas diárias e expõe o painel socioambiental`
18. `refactor(api): versiona rotas em /api/v1 e publica OpenAPI com Scramble`

---

## 7. Segurança, otimização e ferramentas

### 7.1 Segurança

| Tema | Situação | Recomendação |
| :--- | :--- | :--- |
| Proteção de rotas | ✅ Token Sanctum (120 min) + perfil + Policy; logout revoga; 401 encerra a sessão no front. | Migrar o SPA para cookie HttpOnly (Sanctum *stateful*) e manter os tokens para mobile e API pública com *abilities*. |
| Escalada de privilégio | ✅ `tipo_usuario` e `papel` imutáveis via API; CHECKs no banco. | Verificar CNPJ/INEP (§1.4). |
| Força bruta e abuso | ✅ Rate limit no login (5/min por e-mail+IP, 20/min por IP), cadastro (6/min) e rastreio (60/min). | Rate limit por usuário nas escritas. |
| Injeção de SQL | ✅ Só Eloquent e *bindings*; filtros por enum ou `whereLike` com parâmetro; nenhuma interpolação de entrada em SQL. | Manter *whitelist* para ordenação dinâmica. |
| XSS | ✅ React escapa por padrão; textos guardados como texto puro. | Ao introduzir Markdown, usar `react-markdown` sem HTML cru; cabeçalhos CSP e `nosniff` no servidor. |
| Exposição de dados | ✅ Resources separam público e privado; contato só para envolvidos; rastreio sem doadores. | Política LGPD (termo de aceite, exportação e exclusão de dados). |
| Integridade sob concorrência | ✅ Aceite de chamado com `lockForUpdate`; UNIQUEs para candidatura, reação, pontuação e denúncia. | — |

### 7.2 Validação de uploads (STL, 3MF e laudos)

Ainda não implementado. Esta é a especificação para os commits 2 a 4 de §6.2:

| Verificação | STL | 3MF | Laudo (PDF) |
| :--- | :--- | :--- | :--- |
| Extensão e tamanho | `.stl`, ≤ 50 MB | `.3mf`, ≤ 50 MB | `.pdf`, ≤ 10 MB |
| Assinatura real | Binário: `84 + 50 × nTriângulos == tamanho`; ASCII: começa com `solid` e contém `facet normal` | ZIP (`PK\x03\x04`) contendo `3D/3dmodel.model` e `[Content_Types].xml` | Começa com `%PDF-` |
| Ataques | Limite de triângulos (ex.: 5 milhões) | **Zip bomb**: soma descompactada ≤ 200 MB e taxa ≤ 100×; XML lido com `LIBXML_NONET` (sem XXE) | Rejeitar `/JavaScript` e `/Launch` |
| Armazenamento | Disco **privado**, nome UUID, `sha256` em `anexos_documentos` (deduplicação e auditoria) | idem | idem |
| Pós-processamento (fila) | ClamAV; volume (soma de tetraedros), *bounding box* e miniatura | idem | ClamAV; `status_verificacao` → aprovado só após scan e conferência do laboratório |
| Download | `Storage::temporaryUrl()` ou rota assinada de 5 min, com rate limit | idem | Visível para o laboratório emissor e no rastreio do lote |

Infraestrutura: `upload_max_filesize = 64M` e `post_max_size = 70M` no PHP; `client_max_body_size 70m` no Nginx.

### 7.3 Performance e cache

- **Já aplicado:**
  - paginação em todas as listas;
  - *eager loading* (`with`) nas listagens;
  - índices em FKs, status e (status, data_publicacao);
  - `pontos_total` desnormalizado para o ranking;
  - *lazy loading* de rotas no front.
- **Cache (Redis):**
  - `Cache::flexible` para catálogos (polímeros, selos, opções de chamado), ranking (5 min) e páginas de rastreio (10 min, invalidadas ao registrar evento ou laudo);
  - `CACHE_STORE=redis` e `QUEUE_CONNECTION=redis` em produção.
- **PostgreSQL:**
  - `EXPLAIN ANALYZE` nas listagens principais;
  - índice GIN `to_tsvector('portuguese', titulo || texto)` para a busca de projetos e notícias;
  - PostGIS com índice GiST para o mapa;
  - `pg_stat_statements` em produção.
- **Filas:** varredura de anexos, extração de geometria, notificações e agregação diária do painel de impacto.
- **Front:**
  - TanStack Query (cache e *prefetch*);
  - remover MUI (cerca de 300 kB);
  - visualizador 3D (three.js) e mapa (Leaflet) só sob demanda.

### 7.4 Bibliotecas, extensões e Skills/MCPs

**Backend:**
- `spatie/laravel-medialibrary` (uploads);
- `laravel/scout` com o driver `database` (busca);
- `laravel/horizon` (filas);
- `simplesoftwareio/simple-qrcode` (etiqueta do lote);
- `dedoc/scramble` (OpenAPI);
- `laravel-lang/lang` (pt-BR);
- `larastan/larastan` (análise estática);
- `laravel/telescope` (dev);
- `tpetry/laravel-postgresql-enhanced` (índices parciais, GIN e `NOT VALID` sem SQL cru).

**Frontend:**
- `@tanstack/react-query`;
- `react-hook-form` + `zod`;
- `lucide-react` + Radix/shadcn;
- `@react-three/fiber` (STL/3MF);
- `react-leaflet`;
- `qrcode.react` e `@yudiel/react-qr-scanner`;
- `recharts`;
- `msw` (mocks em teste);
- `@playwright/test` (E2E).

**VS Code:**
- PHP Intelephense;
- Laravel (oficial);
- Laravel Pint;
- PHPStan;
- Pest;
- ESLint, Prettier e Tailwind CSS IntelliSense;
- **PostgreSQL** (Microsoft) ou SQLTools com o driver PostgreSQL;
- GitLens;
- Error Lens;
- REST Client (coleção `docs/api.http`);
- Mermaid Preview;
- Code Spell Checker com o dicionário pt-BR.

**Integração contínua:**
- já roda: Pint, Pest (PostgreSQL 16 + SQLite), Vitest e build;
- a adicionar: Larastan, `composer audit`/`npm audit`, Playwright contra o seed de demonstração, Dependabot e *branch protection*.

**Claude Code (Skills, MCPs, hooks):**
1. **`CLAUDE.md`** na raiz e em `backend/` e `frontend/`. Deve registrar:
   - o banco é PostgreSQL com DDL legado;
   - toda migration nova usa `generatedAs()->always()`, nome explícito de constraint e CHECK com `NOT VALID` quando houver dados legados;
   - permissões se resolvem em `Usuario::temPerfil()`;
   - os testes rodam em `pgsql` e `sqlite`.
2. **Laravel Boost** (`php artisan boost:install` → Claude Code). Hoje ele está configurado só para o Junie, com caminho do Windows. O MCP dá ao Claude `database-schema`, `list-routes`, `last-error` e `search-docs` da versão exata do framework.
3. **MCP de PostgreSQL somente leitura** (ex.: `@modelcontextprotocol/server-postgres` apontando para um usuário `readonly`), para o Claude consultar o esquema e os dados reais antes de propor migrations.
4. **Skills de projeto** em `.claude/skills/`:
   - `nova-migration-postgres`: checklist de identity, constraints nomeadas, `NOT VALID`, índice em FK e teste em pgsql;
   - `novo-endpoint-com-perfil`: rota no grupo `perfil:`, FormRequest, Policy, Resource e teste de 401/403/200;
   - `upload-seguro`: §7.2.
5. **Hooks:** `PostToolUse` em `*.php` → `vendor/bin/pint --dirty`; em `*.jsx` → `prettier --write`. `SessionStart` → `composer install && npm ci` e PostgreSQL de teste.
6. **Figma MCP** para converter as telas do protótipo, **Playwright MCP** para validar fluxos por perfil e **GitHub MCP** para issues e PRs por módulo.
