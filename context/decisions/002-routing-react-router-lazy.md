# Decision: Roteamento com react-router v6 + lazy-loading

## Context
Aplicação com ~17 rotas distintas (home + CRUD de várias entidades + visualizações de premiação). Algumas páginas são grandes (`create-game.tsx`, `create-awards.tsx` passam de 400–500 linhas) e carregam muitas dependências (selects assíncronos, datagrid). Carregar tudo no bundle inicial penalizava o time-to-interactive.

## Decision
Usar `createBrowserRouter` do `react-router-dom` v6. Cada página é importada com `React.lazy(() => import(...))` e envolvida por `<Suspense fallback={<CircularProgress />}>`. Há uma rota fallback `path: "*"` que renderiza uma página "404" com botão para voltar ao início.

Tabela central de rotas vive em `src/router.js`; create e edit compartilham o mesmo componente, diferenciados pela presença do param `:id`.

## Rationale
- Lazy split reduz o bundle inicial — páginas de nicho (awards view, votes) só carregam quando acessadas.
- `createBrowserRouter` permite configuração declarativa centralizada, facilitando auditoria de rotas.
- Rota 404 evita tela em branco em URLs digitadas incorretamente.

## Alternatives Considered
- **Manter imports top-level**: rejeitado no refactor por inflar o bundle inicial.
- **Route-based code splitting via webpack sem `React.lazy`**: mais verboso, mesma finalidade.
- **TanStack Router / Next.js**: troca muito invasiva para o ganho marginal.

## Outcomes
- Após refactor 2026-04-13: bundle inicial reduzido; fallback 404 adicionado.

## Related
- [Project Intent](../intent/project-intent.md)
- [Decision: Stack tecnológica](001-tech-stack.md)
- [Pattern: Rotas create/edit compartilhadas](../knowledge/patterns/shared-create-edit-route.md)
- [Pattern: Rotas lazy-loaded](../knowledge/patterns/lazy-route.md)

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Accepted
