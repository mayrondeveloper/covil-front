# Decision: Stack tecnológica

## Context
Aplicação SPA administrativa com cadastros CRUD (jogos, premiação, referências), formulários complexos com múltiplos selects assíncronos, e tabelas interativas. Projeto iniciado com Create React App e posteriormente *ejetado* para customizar webpack.

## Decision
- **Linguagem/UI**: React 18 + TypeScript (mix com arquivos `.js`/`.jsx` legados).
- **Build**: Create React App ejetado (webpack 5 em `config/webpack.config.js`, scripts em `scripts/`).
- **UI kit**: MUI v5 (`@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`) sobre Emotion.
- **HTTP**: Axios 1.x via instância única (`src/services/axios/axios.ts`) com interceptor global de erro.
- **Formulários**: `react-hook-form` 7.
- **Notificações**: `react-toastify` com `ToastContainer` único montado globalmente.
- **Roteamento**: `react-router-dom` v6 com `createBrowserRouter` e lazy-loading.
- **Server state**: `@tanstack/react-query` v4.
- **Package manager**: Yarn 1.22.22. Node 20.x.

## Rationale
- CRA ejetado permite customização do webpack sem abandonar o tooling (hoje ainda carrega React Refresh, eslint-webpack-plugin, source-map-loader configurados).
- MUI cobre o vocabulário de UI necessário (Tabela, Drawer, Autocomplete, Paper, Stack) e reduz decisões de design.
- Axios foi mantido por já ser padrão do projeto; centralizar a instância permite interceptor global.
- react-hook-form é leve e integra bem com Controller + componentes MUI controlados.
- React Query foi introduzido no refactor para eliminar `useEffect + useState` manuais em fetches, dar cache e dedupe de requisições.
- Yarn 1 foi mantido por compatibilidade com `yarn.lock` e script `build:digitalOcean`.

## Alternatives Considered
- **Tailwind**: estava listado no `package.json`, mas nunca configurado (sem `tailwind.config.js`) nem usado em classes. Removido no refactor em favor de `sx` do MUI.
- **FontAwesome**: estava listado, mas o projeto usa `@mui/icons-material`. Removido.
- **Redux / Zustand**: descartado — não há estado global relevante além de server state (coberto por React Query) e formulário (coberto por react-hook-form).
- **npm / pnpm**: não adotados para não divergir do `yarn.lock` existente.

## Outcomes
- Refactor 2026-04-13: removidas deps não usadas (FontAwesome, Tailwind, localforage, match-sorter, sort-by); adicionado Prettier e React Query; build continua funcionando.

## Related
- [Project Intent](../intent/project-intent.md)
- [Decision: Camada HTTP com interceptor global](003-http-axios-interceptor.md)
- [Decision: Server state com React Query](005-server-state-react-query.md)
- [Decision: Formulários com react-hook-form](004-forms-react-hook-form.md)
- [Decision: Notificações centralizadas](006-notifications-toast.md)
- [Decision: Roteamento com lazy-loading](002-routing-react-router-lazy.md)

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Accepted
- **Note**: Documentado a partir da implementação existente.
