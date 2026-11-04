# Ferramentas, servidores MCP e Skills — instalação passo a passo

Guia para deixar o ambiente de desenvolvimento do EcoHub 3D pronto para trabalhar com o **Claude Code**:
- o Claude lê o esquema do banco e as rotas reais;
- valida telas no navegador;
- consulta o Figma;
- formata o código sozinho.

Os comandos valem para Linux, macOS e WSL. No Windows (PowerShell), troque `export VAR=...` por `$env:VAR="..."`.

| Ferramenta | Para que serve no projeto | Onde fica a configuração |
| :--- | :--- | :--- |
| **Laravel Boost** (MCP) | Esquema do banco, `list-routes`, `last-error`, `tinker` e documentação da versão exata do Laravel 13 | `.mcp.json` → `laravel-boost` |
| **PostgreSQL MCP** (somente leitura) | Consultar tabelas, constraints e planos de execução reais antes de propor uma migration | `.mcp.json` → `postgres` |
| **Playwright MCP** | Abrir o front, entrar com cada perfil de demonstração e conferir telas | `.mcp.json` → `playwright` |
| **Figma MCP** | Ler as telas e os diagramas do arquivo *EcoHub 3D — Diagramas* e gerar código a partir deles | `.mcp.json` → `figma` |
| **GitHub MCP** | Issues e PRs por módulo | escopo do usuário (tem token) |
| **Skills e hooks** | Checklists do projeto e formatação automática | `.claude/` |

O arquivo [`.mcp.json`](../.mcp.json) na raiz já declara os quatro servidores de projeto. Ao abrir o Claude Code na pasta do repositório, ele pede para aprovar cada um.

---

## 0. Pré-requisitos

```bash
php -v            # 8.4+
composer -V       # 2.x
node -v           # 20+
psql --version    # 14+
uv --version      # gerenciador Python usado pelo MCP de PostgreSQL
claude --version  # Claude Code
```

Para instalar o que faltar:

```bash
# Claude Code
npm install -g @anthropic-ai/claude-code

# uv (fornece o comando uvx)
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## 1. Laravel Boost (MCP do Laravel)

O pacote já está no `composer.json` (`laravel/boost ^2.2`), mas foi configurado só para o Junie, com caminho do Windows (`backend/.junie/mcp/mcp.json`).

```bash
cd backend
composer install
php artisan boost:install
```

No assistente interativo:
1. marque **Claude Code** (pode manter o Junie);
2. aceite **guidelines**, **skills** e **MCP**.

O Boost então gera:
- `CLAUDE.md` com as diretrizes do Laravel 13 e do Pest 4;
- as skills `laravel-best-practices` e `pest-testing` em `.claude/skills/`.

Como o Claude Code será aberto na **raiz** do repositório, o servidor fica declarado no `.mcp.json` da raiz, apontando para `backend/artisan`:

```json
"laravel-boost": {
    "command": "php",
    "args": ["backend/artisan", "boost:mcp"]
}
```

Alternativa, pela linha de comando (mesmo efeito):

```bash
claude mcp add --scope project laravel-boost -- php backend/artisan boost:mcp
```

Para testar, abra o Claude Code e rode `/mcp`. Deve aparecer `laravel-boost · connected`. Peça, por exemplo: *"use list-routes e mostre as rotas com perfil:receptor"*.

---

## 2. PostgreSQL MCP (somente leitura)

**Nunca** conecte o Claude com o usuário dono do banco. Crie um papel só de leitura:

```bash
sudo -u postgres psql -d ecohub_dev <<'SQL'
CREATE ROLE ecohub_leitura LOGIN PASSWORD 'troque-esta-senha';
GRANT CONNECT ON DATABASE ecohub_dev TO ecohub_leitura;
GRANT USAGE ON SCHEMA public TO ecohub_leitura;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ecohub_leitura;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ecohub_leitura;
-- dados pessoais fora do alcance do assistente
REVOKE SELECT ON usuario, personal_access_tokens, password_reset_tokens, sessions FROM ecohub_leitura;
SQL
```

Exporte a URL antes de abrir o Claude Code. O `.mcp.json` lê essa variável e, se ela não existir, usa o valor padrão local:

```bash
export ECOHUB_DB_READONLY_URI="postgresql://ecohub_leitura:troque-esta-senha@localhost:5432/ecohub_dev"
claude
```

Configuração usada (servidor [`postgres-mcp`](https://github.com/crystaldba/postgres-mcp), em modo `restricted`, que só aceita leitura):

```json
"postgres": {
    "command": "uvx",
    "args": ["postgres-mcp", "--access-mode=restricted"],
    "env": { "DATABASE_URI": "${ECOHUB_DB_READONLY_URI:-postgresql://ecohub_leitura:troque-esta-senha@localhost:5432/ecohub_dev}" }
}
```

Equivalente pela linha de comando:

```bash
claude mcp add --scope project postgres \
  -e DATABASE_URI="$ECOHUB_DB_READONLY_URI" \
  -- uvx postgres-mcp --access-mode=restricted
```

> O servidor de referência antigo, `@modelcontextprotocol/server-postgres`, foi arquivado. Prefira o `postgres-mcp`, que também analisa índices e planos de execução (`EXPLAIN`).

---

## 3. Playwright MCP (validação de telas por perfil)

```bash
claude mcp add --scope project playwright -- npx -y @playwright/mcp@latest --headless
```

Antes de usar, suba backend e frontend com o seed de demonstração:

```bash
cd backend && php artisan migrate:fresh --seed && php artisan serve   # :8000
cd frontend && npm run dev                                           # :5173
```

Exemplo de pedido ao Claude: *"entre como `escola@ecohub3d.test` / `Senha@123`, abra /chamados e confira se o botão Novo chamado aparece; depois repita com `maker@ecohub3d.test` e confira que ele não aparece"*.

---

## 4. Figma MCP

```bash
claude mcp add --scope project --transport http figma https://mcp.figma.com/mcp
```

Na primeira chamada, rode `/mcp` → `figma` → **Authenticate** para fazer o login OAuth no navegador. Os arquivos úteis são:
- **EcoHub 3D — Diagramas UML e Banco de Dados**, com quatro páginas: Banco de dados, UML — Classes, UML — Casos de uso e Mapa de telas e jornadas;
- **Register Page for Web**: referência das telas de login e cadastro.

> Arquivos da **Comunidade** (`figma.com/community/file/...`) não são lidos pelo MCP. Para usar um deles, clique em **Open in Figma** (duplicar para os seus rascunhos) e passe a URL `figma.com/design/...` da cópia.

---

## 5. GitHub MCP (escopo do usuário)

Este servidor fica fora do `.mcp.json` porque precisa de um token pessoal. Crie um *fine-grained token* com acesso ao repositório `LuizFelipeDias/IC` (Issues e Pull requests: *read and write*):

```bash
export GITHUB_PAT=github_pat_xxx
claude mcp add --scope user --transport http github https://api.githubcopilot.com/mcp/ \
  -H "Authorization: Bearer $GITHUB_PAT"
```

---

## 6. Hooks e Skills do projeto

Crie `.claude/settings.json` para formatar automaticamente cada arquivo editado pelo Claude:

```json
{
    "hooks": {
        "PostToolUse": [
            {
                "matcher": "Edit|Write",
                "hooks": [
                    {
                        "type": "command",
                        "command": "f=$(jq -r '.tool_input.file_path'); case \"$f\" in *.php) cd backend && vendor/bin/pint \"$f\" -q ;; esac; exit 0"
                    }
                ]
            }
        ]
    }
}
```

Skills recomendadas, em `.claude/skills/<nome>/SKILL.md`:

| Skill | Conteúdo |
| :--- | :--- |
| `nova-migration-postgres` | `generatedAs()->always()`, constraint com nome explícito (`{tabela}_{coluna}_fkey`), CHECK só no pgsql e com `NOT VALID` em tabela com dados legados, índice em toda FK, teste em pgsql **e** sqlite. |
| `novo-endpoint-com-perfil` | Rota dentro do grupo `perfil:...`, FormRequest em português, Policy, Resource (público × privado) e testes de 401, 403 e 200. |
| `upload-seguro` | Regras `ModeloImpressao3d` e `LaudoPdf`, disco privado, nome UUID, `sha256`, job `VerificarAnexo` e URL assinada. |
| `tela-com-design-system` | Só CSS puro com os tokens de `styles/tokens.css`, componentes de `components/ui.jsx`, `pode()` para mostrar ações e teste visual com Playwright. |

---

## 7. Extensões do VS Code

```bash
code --install-extension bmewburn.vscode-intelephense-client
code --install-extension laravel.vscode-laravel
code --install-extension open-southeners.laravel-pint
code --install-extension SanderRonde.phpstan-vscode
code --install-extension m1guelpf.better-pest
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-ossdata.vscode-pgsql
code --install-extension eamodio.gitlens
code --install-extension usernamehw.errorlens
code --install-extension humao.rest-client
code --install-extension bierner.markdown-mermaid
code --install-extension streetsidesoftware.code-spell-checker-portuguese-brazilian
code --install-extension figma.figma-vscode-extension
```

## 8. Variáveis de ambiente usadas pelas integrações do backend

```dotenv
# backend/.env
ANTIVIRUS_DRIVER=clamav        # padrão: nenhum (os anexos ficam com verificação "pendente")
CLAMAV_HOST=127.0.0.1
CLAMAV_PORT=3310
QUEUE_CONNECTION=database      # o job VerificarAnexo roda com: php artisan queue:work
CACHE_STORE=database           # em produção: redis
```

ClamAV local para desenvolvimento:

```bash
docker run -d --name clamav -p 3310:3310 clamav/clamav:stable
```
