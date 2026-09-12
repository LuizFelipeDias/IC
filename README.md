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

**Back-end**
- PHP — APIs e regras de negócio
- Banco de dados relacional
- Autenticação por token

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

- Node.js 18 ou superior
- PHP 8.0 ou superior
- Servidor de banco de dados relacional

### Back-end

```bash
cd backend
# configure as credenciais do banco conforme o arquivo de exemplo
php -S localhost:8000
```

### Front-end

```bash
cd frontend
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`, e as APIs em `http://localhost:8000`.

> **Observação:** as credenciais de banco e as variáveis de ambiente não são versionadas. Crie os arquivos de configuração locais a partir dos exemplos antes de executar o projeto.

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
