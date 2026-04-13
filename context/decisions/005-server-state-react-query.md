# Decision: Server state com @tanstack/react-query

## Context
Antes do refactor, cada página fazia fetch manual com `useEffect` + `useState` + `.catch(console.log)`. Sem cache, sem dedupe, sem invalidação coordenada. Listas eram recarregadas a cada montagem da página; quando múltiplos componentes precisavam do mesmo recurso (ex.: categorias no formulário de jogo), cada um disparava sua própria request.

## Decision
Adotar `@tanstack/react-query` v4. `QueryClientProvider` montado em `src/index.tsx` com defaults globais: `staleTime: 30s`, `retry: 1`, `refetchOnWindowFocus: false`. Hooks por recurso em `src/hooks/queries.ts` (`useGames`, `useAwards`, `useCategories`, etc.) com chaves padronizadas em `qk`. Mutations (`useDeleteGame`) invalidam a query correspondente no `onSuccess`.

Adoção **incremental**: novas telas devem usar os hooks; telas legadas migram conforme tocadas.

## Rationale
- Cache por default elimina refetches redundantes e simplifica código de página.
- `staleTime` de 30s equilibra frescor e economia de requests para dados de cadastro (mudam pouco durante uma sessão).
- `retry: 1` evita rajadas em servidores instáveis sem mascarar erros reais.
- `refetchOnWindowFocus: false` — a aplicação é administrativa; refetch automático ao trocar aba confunde operadores.
- Centralizar chaves em `qk` evita bugs de invalidação com strings soltas.

## Alternatives Considered
- **SWR**: API similar, menos recursos de mutation/invalidation em lote. React Query venceu por ter mais maturidade em cenários de cache coordenado.
- **Redux Toolkit Query**: exigiria trazer Redux só por isso; excesso para o tamanho do projeto.
- **Manter fetch manual**: rejeitado — duplicação + ausência de cache era a dor principal.

## Outcomes
- Provider e hooks em produção; adoção nas páginas legadas é follow-up.

## Related
- [Project Intent](../intent/project-intent.md)
- [Decision: Stack tecnológica](001-tech-stack.md)
- [Decision: Camada HTTP com interceptor global](003-http-axios-interceptor.md)
- [Pattern: Hooks React Query por recurso](../knowledge/patterns/react-query-resource-hooks.md)

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Accepted
