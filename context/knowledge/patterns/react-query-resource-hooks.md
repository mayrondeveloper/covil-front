# Pattern: Hooks React Query por recurso

## Description
Um módulo centralizado (`src/hooks/queries.ts`) expõe um hook `useX` por recurso (`useGames`, `useAwards`, `useCategories`, ...), além de mutations (`useDeleteGame`). Chaves de query padronizadas ficam em um objeto `qk`.

## When to Use
- Sempre que a UI precisar ler server state.
- Em vez de `useEffect + useState` para fetch.

## Pattern
- Chaves em `qk`: tuplas tipadas para permitir `invalidateQueries(qk.games)` com type-safety.
- Para queries por id/parâmetro: factory function em `qk` (`qk.game(id)`) e `enabled` no `useQuery` para suprimir chamada com id vazio.
- Para mutations: invalidar a query correspondente em `onSuccess`.

## Example
```ts
// src/hooks/queries.ts
export const qk = {
  games: ["games"] as const,
  game: (id: Id) => ["games", id] as const,
};

export const useGames = () =>
  useQuery(qk.games, () => games.fetch().then((r) => r.data));

export const useGame = (id?: Id) =>
  useQuery(qk.game(id!), () => games.fetchOne(id!).then((r) => r.data), {
    enabled: id !== undefined && id !== null && id !== "",
  });

export const useDeleteGame = () => {
  const qc = useQueryClient();
  return useMutation((id: Id) => games.deleteGame(id), {
    onSuccess: () => qc.invalidateQueries(qk.games),
  });
};
```

Consumo em página:

```tsx
const { data: games = [], isLoading } = useGames();
const deleteGame = useDeleteGame();
// ...
deleteGame.mutate(id);
```

## Files Using This Pattern
- `src/hooks/queries.ts` — definições
- `src/index.tsx` — monta `QueryClientProvider` com defaults

## Related
- [Decision: Server state com React Query](../../decisions/005-server-state-react-query.md)
- [Pattern: Serviço HTTP por recurso](service-module.md)

## Status
- **Created**: 2026-04-13
- **Status**: Active
