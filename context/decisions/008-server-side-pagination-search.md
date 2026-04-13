# Decision: Paginação e busca server-side

## Context
Após o catálogo crescer (jogos, votantes, votos) o fetch "tudo de uma vez" virou problema: lentidão, falta de scroll dentro de selects, sem como achar item específico. Backend foi atualizado para devolver `{ data, total, page, limit }` e aceitar `?q=` em todos os endpoints de listagem; também aceita `?orderBy=` + `?order=` para os votos.

## Decision
- **Resposta paginada padrão**: services principais (`games`, `awards`, `award-categories`, `participants`, `votes`, `categories`, `publishers`, `artists`, `designers`, `mechanisms`) expõem **dois métodos**:
  - `fetchPage(params?: PageParams)` → retorna `Promise<AxiosResponse<Paginated<T>>>`
  - `fetch()` → wrapper legado que chama `fetchPage({ limit: 200 })` e devolve array via helper `unwrap` para back-compat.
- **Tipo `PageParams`** (em `src/services/types.ts`): `{ page?, limit?, q?, orderBy?, order? }`.
- **Tipo `Paginated<T>`**: `{ data: T[]; total: number; page: number; limit: number }`.
- **Helper `unwrap`** em `src/services/pagination.ts`. Constante `MAX_LIMIT = 200`.
- **Tabelas com paginação real**: SimpleNameForm (catalog refs), Games, Dragão de Ouro, AwardParticipants, AwardCategories, Votes (em ambas as páginas).
- **Default rowsPerPage**: 10 (com seletor 10/25/50/100).
- **Busca**: campo `SearchField` com debounce de 350ms e botão de limpar, plugado no `toolbar` do `GenericTable`. Reseta para página 1 ao buscar.
- **OrderBy**: enviado como `?orderBy=createdAt&order=desc` para votos (em ambas páginas + home). O frontend não faz mais `.reverse()`.

## Rationale
- Manter `fetch()` evita migrar tudo de uma vez. Páginas que ainda não foram migradas continuam funcionando (capadas em 200 itens).
- Paginação server-side com `total` permite mostrar contadores reais ("X jogos no total") em vez do tamanho do array.
- Busca server-side é única forma escalável; fazer client-side em listas paginadas misturaria filtro local com servidor, causando UX inconsistente.
- OrderBy server-side resolve a falha do `.reverse()` ao paginar (que só ordenava a página atual).

## Alternatives Considered
- **Migrar `fetch()` para sempre devolver shape paginado**: rejeitado — exigiria atualizar todos os ~30 callsites simultaneamente.
- **Filtros client-side com cache de "tudo"**: viável só enquanto datasets fossem pequenos; quebra em produção.
- **DataGrid Pro com server-side mode**: acrescentaria peso e licença; o `GenericTable` atende.

## Outcomes
- 7 tabelas migradas e usando `?page=&limit=&q=` (incluindo a tabela de votos com `?orderBy=createdAt&order=desc`).
- Home agora exibe `total` real (de `?limit=1` apenas para contagem).
- Paginação no wizard `new-votes` é client-side (lista vem nested no award), não server-side.

## Related
- [Project Intent](../intent/project-intent.md)
- [Decision: Stack tecnológica](001-tech-stack.md)
- [Decision: Server state com React Query](005-server-state-react-query.md)
- [Pattern: Tabela genérica](../knowledge/patterns/generic-table.md)
- [Pattern: Busca + paginação server-side](../knowledge/patterns/search-and-pagination.md)

## Status
- **Created**: 2026-04-13 (Phase: Build)
- **Status**: Accepted
