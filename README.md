<div align="center">

# EcoHub 3D

### Plataforma Digital para Sustentabilidade, Cooperação e Inovação no Ecossistema da Impressão 3D

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

![Status](https://img.shields.io/badge/status-protótipo%20funcional-blue?style=flat-square)
![Back-end](https://img.shields.io/badge/back--end-concluído-success?style=flat-square)
![Front-end](https://img.shields.io/badge/front--end-em%20desenvolvimento-orange?style=flat-square)
![Licença](https://img.shields.io/badge/licença-acadêmica-lightgrey?style=flat-square)

*Programa Institucional de Iniciação em Desenvolvimento Tecnológico e Inovação — PIBITI*
**Universidade Estadual de Ponta Grossa — UEPG**

</div>

---

## Sobre o projeto

Não existe hoje no Brasil uma plataforma digital dedicada ao ecossistema de impressão 3D com foco em **economia circular**, reciclagem de filamentos e interconexão entre *makers*, professores, demandantes e empresas. As soluções disponíveis atendem demandas isoladas — serviços, rede social, cursos — mas nenhuma reúne esses elementos em um único ambiente.

A **EcoHub 3D** nasce para preencher essa lacuna, atuando como agente integrador que aproxima o conhecimento acadêmico das demandas do mercado e organiza o ciclo de vida dos materiais, do filamento à peça descartada.

---

## Módulos da plataforma

| Módulo | Descrição |
| :--- | :--- |
| **Currículos** | Banco de talentos especializados em manufatura aditiva |
| **Chamados** | Rede de suporte técnico, com atendimento a escolas públicas |
| **Vagas** | Divulgação de oportunidades no setor |
| **Notícias** | Curadoria de conteúdo técnico e de mercado |
| **Projetos** | Espaço para publicação e divulgação de projetos |

Os cinco módulos foram concebidos para operar de forma integrada, e não como serviços independentes — esse é o principal diferencial da proposta.

---

## Estado do desenvolvimento

### Back-end — concluído

A camada de servidor encontra-se **finalizada e estável**. Foram implementados e validados:

- Rotas e *endpoints* das APIs de todos os módulos
- Autenticação de usuários com emissão e validação de token
- Operações de criação, leitura, atualização e exclusão (CRUD) das entidades
- Modelagem e persistência dos dados
- Tratamento de erros e validação das requisições

### Front-end — em desenvolvimento

A interface está **parcialmente implementada**. O protótipo de alta fidelidade e o sistema de design estão concluídos, mas a conversão das telas em componentes React ainda não foi finalizada.

| Tela | Situação |
| :--- | :---: |
| Login | Implementada |
| Cadastro de usuário | Implementada |
| Home / Hub | Implementada |
| Cadastro de currículo | Implementada |
| Cadastro de vaga | Parcial |
| Notícias | Parcial |
| Chamados | Pendente |
| Projetos | Pendente |

**Pendências conhecidas do front-end:**

- Concluir a integração das telas parciais com as APIs já disponíveis
- Implementar os módulos de chamados e de projetos
- Padronizar o tratamento de estados de carregamento e de erro
- Revisar responsividade e acessibilidade
- Realizar testes de interface com usuários reais

### Implantação — pendente

Todo o desenvolvimento e os testes ocorreram em **ambiente local (`localhost`)**. A plataforma ainda não foi publicada em servidor, o que impede avaliar seu comportamento sob condições reais de rede, concorrência de acessos e volume de dados.

---

## Tecnologias utilizadas

**Front-end**
- React — construção da interface por componentes
- JavaScript (ES6+)
- Tailwind CSS — estilização utilitária
- Vite — servidor de desenvolvimento e empacotamento
- Vitest + Testing Library — testes

**Back-end**
- PHP 8.4 + Laravel 13 — APIs e regras de negócio
- MySQL (SQLite nos testes)
- Laravel Sanctum — autenticação por token
- Pest — testes automatizados

**Design e gestão**
- Figma — *wireframes* e protótipo de alta fidelidade
- Notion — documentação e quadros Kanban

---

## Estrutura do repositório

```
IC/
├── backend/              # APIs em PHP — camada concluída
├── frontend/             # Aplicação React — em desenvolvimento
│   ├── public/
│   ├── src/              # Componentes, páginas e serviços
│   ├── package.json
│   └── tailwind.config.js
├── .gitignore
└── README.md
```

---

## Como executar localmente

### Pré-requisitos

- PHP **8.4** ou superior (exigido pelas dependências do `composer.lock`) com as extensões `pdo_mysql` ou `pdo_sqlite`
- Composer 2
- Node.js 20 ou superior
- MySQL 8 (ou SQLite para testes rápidos)

### Back-end

```bash
cd backend
composer install
cp .env.example .env          # ajuste DB_DATABASE, DB_USERNAME e DB_PASSWORD
php artisan key:generate
php artisan migrate --seed    # cria as tabelas e os dados de demonstração
php artisan serve             # http://localhost:8000
```

Usuários de demonstração criados pelo seed (senha `Senha@123`):

| Perfil | E-mail |
| :--- | :--- |
| Estudante | `estudante@ecohub3d.test` |
| Empresa | `empresa@ecohub3d.test` |

> **Banco criado manualmente antes das migrations:** as tabelas já existem e o `migrate` vai acusar conflito. Em ambiente de desenvolvimento, o caminho mais simples é recriar o banco com `php artisan migrate:fresh --seed` (**apaga todos os dados**). Se precisar preservar os dados, exporte-os antes (`mysqldump --no-create-info`) e reimporte depois do `migrate:fresh`.

### Front-end

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:8000/api
npm run dev                   # http://localhost:5173
```

### Testes

```bash
cd backend && php artisan test        # Pest — autenticação e autorização da API
cd frontend && npm test -- --run      # Vitest — cliente da API e rotas protegidas
```

O GitHub Actions (`.github/workflows/ci.yml`) roda Pint, Pest, Vitest e o build do front a cada push e pull request.

### Principais rotas da API

| Método | Rota | Acesso |
| :--- | :--- | :--- |
| `POST` | `/api/login`, `/api/usuario` (cadastro) | público, com limite de tentativas |
| `GET` | `/api/vaga`, `/api/noticia`, `/api/projeto` (+ `/{id}`) | público, paginado (`?per_page=`, máx. 100) |
| `POST` | `/api/logout` | autenticado (revoga o token) |
| `GET` `PATCH` `DELETE` | `/api/usuario/me` | autenticado (só os próprios dados) |
| `GET` | `/api/vaga/minhas`, `/api/vaga/{id}/candidaturas` | autenticado (dono da vaga) |
| `POST` `PUT` `DELETE` | `/api/vaga`, `/api/noticia`, `/api/projeto`, `/api/chamado`, `/api/curriculo`, `/api/candidatura` | autenticado; alterar/excluir só o autor |

---

## Próximos passos para a continuidade

1. **Concluir o front-end**, finalizando as telas parciais e os módulos pendentes
2. **Contratar hospedagem**, com domínio, certificado digital e rotina de *backup*
3. **Implantar em servidor** e validar a integração entre front-end e back-end fora do ambiente local
4. **Testar com usuários reais** do setor de impressão 3D, cobrindo os cinco módulos
5. **Publicar versão piloto** e definir indicadores de uso e de impacto na economia circular

---

## Equipe

| Papel | Nome |
| :--- | :--- |
| Acadêmico | Luiz Felipe Dias de Araujo — Engenharia de Computação |
| Orientador | Prof. Benjamim de Melo Carvalho |
| Coorientador | Prof. Dr. Maurício Zadra Pacheco |

**Projeto vinculado a:** *Processamento, Caracterização e Desenvolvimento de Sistemas Poliméricos Sintéticos e Naturais*

**Vigência:** setembro de 2025 a agosto de 2026

---

## Palavras-chave

`Impressão 3D` · `Economia Circular` · `Plataforma Digital` · `Manufatura Aditiva` · `Reciclagem` · `Inovação Digital`

---

<div align="center">

Desenvolvido no âmbito do PIBITI — Universidade Estadual de Ponta Grossa

</div>
