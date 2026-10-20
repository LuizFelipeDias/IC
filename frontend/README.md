# EcoHub 3D — Front-end

SPA em React 19 + Vite + Tailwind CSS que consome a API Laravel em `../backend`.

```bash
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:8000/api
npm run dev            # servidor de desenvolvimento (http://localhost:5173)
npm test -- --run      # testes (Vitest)
npm run build          # build de produção em dist/
```

## Convenções

- **Chamadas à API:** sempre via `api()` de `src/services/api.js` (URL base, token, tratamento de 401 e de erros 422). Não use `fetch` direto nas páginas.
- **Usuário logado:** `useAuth()` de `src/contexts/AuthContext.jsx` (`usuario`, `autenticado`, `entrar`, `sair`).
- **Listas da API** vêm paginadas (`{ data, links, meta }`); use `lista(resposta)` para obter o array.
- **Cor da marca:** classe Tailwind `brand` (`bg-brand`, `text-brand`, `border-brand`).
