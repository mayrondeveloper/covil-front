# Pattern: Serviço HTTP por recurso

## Description
Cada recurso de backend tem um módulo próprio em `src/services/<recurso>-service/<recurso>-service.ts` exportando funções nomeadas (`fetch`, `fetchOne`, `create`, `update`, `remove`). Todas usam a `axiosInstance` compartilhada e paths relativos (sem `baseURL` manual). Tipos de domínio ficam em `src/services/types.ts`.

## When to Use
- Ao adicionar um novo recurso/endpoint de backend.
- Ao migrar um serviço legado ainda em JS ou que concatena `baseURL`.

## Pattern
1. Importar `axiosInstance` de `../axios/axios`.
2. Importar o tipo do recurso de `../types` (ou adicioná-lo lá).
3. Exportar funções nomeadas; cada uma retorna `Promise<AxiosResponse<T>>`.
4. Usar paths relativos (`/games`, nunca `${baseURL}/games`).
5. Usar o tipo `Id` de `../types` para parâmetros de id.

## Example
```ts
// src/services/game-service/game-service.ts
import { axiosInstance } from "../axios/axios";
import { Game, Id } from "../types";

export const fetch = () => axiosInstance.get<Game[]>(`/games`);

export const fetchOne = (id: Id) => axiosInstance.get<Game>(`/games/${id}`);

export const findAllByAwardAndCategory = (id_award: Id, id_category: Id) =>
  axiosInstance.get<Game[]>(`/games/award/${id_award}/category/${id_category}`);

export const create = (data: Partial<Game>) =>
  axiosInstance.post<Game>(`/games`, data);

export const deleteGame = (id: Id) => axiosInstance.delete<void>(`/games/${id}`);

export const update = (id: Id, data: Partial<Game>) =>
  axiosInstance.put<Game>(`/games/${id}`, data);
```

## Files Using This Pattern
- `src/services/game-service/game-service.ts`
- `src/services/awards-service/awards-service.ts`
- `src/services/categories-service/categories-service.ts`
- `src/services/publishers-service/publishers-service.ts`
- `src/services/artists-service/artists-service.ts`
- `src/services/designers-service/designers-service.ts`
- `src/services/mechanisms-service/mechanisms-service.ts`
- `src/services/awards-categories-service/awards-categories-service.ts`
- `src/services/participants-service/participants-service.ts`
- `src/services/votes/votes-service.ts`

## Related
- [Decision: Stack tecnológica](../../decisions/001-tech-stack.md)
- [Decision: Camada HTTP com interceptor global](../../decisions/003-http-axios-interceptor.md)
- [Pattern: Hooks React Query por recurso](react-query-resource-hooks.md)

## Status
- **Created**: 2026-04-13
- **Status**: Active
