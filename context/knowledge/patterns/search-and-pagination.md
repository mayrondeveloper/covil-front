# Pattern: Busca + paginação server-side em tabelas

## Description
Páginas de listagem usam estado local de `page`, `rowsPerPage` e `q`, chamam `service.fetchPage({ page, limit, q })` e passam o resultado + handlers para `GenericTable` via prop `pagination` e `toolbar` (para o `SearchField`).

## When to Use
- Toda nova listagem de entidade que tem volume potencial.
- Mesmo padrão para os 7+ casos já implementados (catalog refs, games, awards, votes, participants, etc.).

## Pattern
1. Estado: `page` (1-based), `rowsPerPage` (default 10), `q` (string vazia).
2. `useCallback fetchData` com deps `[page, rowsPerPage, q]`. `q || undefined` para não enviar query vazia.
3. `useEffect(fetchData, [fetchData])` dispara em qualquer mudança.
4. Após criar/excluir registro: chamar `fetchData()` (ou voltar para `page=1` em create).
5. `GenericTable` recebe `pagination={{ page, rowsPerPage, total, onPageChange, onRowsPerPageChange }}` e `toolbar={<SearchField ...>}`.
6. Mudança de busca reseta `setPage(1)`.

## Example
```tsx
const [data, setData] = useState<T[]>([]);
const [total, setTotal] = useState(0);
const [page, setPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);
const [q, setQ] = useState("");

const fetchData = useCallback(() => {
  fetchPage({ page, limit: rowsPerPage, q: q || undefined }).then((r) => {
    setData(r.data.data);
    setTotal(r.data.total);
  });
}, [page, rowsPerPage, q]);

useEffect(() => { fetchData(); }, [fetchData]);

return (
  <GenericTable<T>
    data={data}
    rowKey={(r) => r.id}
    columns={[...]}
    actions={[...]}
    pagination={{
      page, rowsPerPage, total,
      onPageChange: setPage,
      onRowsPerPageChange: (rows) => { setRowsPerPage(rows); setPage(1); },
    }}
    toolbar={
      <SearchField
        value={q}
        onChange={(v) => { setQ(v); setPage(1); }}
        placeholder="Buscar…"
      />
    }
  />
);
```

## Para listas de votos
Adicionar `orderBy: "createdAt", order: "desc"` no `fetchPage` para mostrar os mais recentes primeiro. **Não** usar `.reverse()` no client — quebra entre páginas.

## Files Using This Pattern
- `src/components/Form/SimpleNameForm.tsx` (todos os catalog refs)
- `src/pages/games/games.tsx`
- `src/pages/dragao-de-ouro/create/dragao-de-ouro.tsx`
- `src/pages/award-categories/create/create-award-categories.tsx`
- `src/pages/award-participants/create/create-award-participants.tsx`
- `src/pages/votes/create/votes.tsx`
- `src/pages/votes/create/new-votes.tsx`

## Related
- [Decision: Paginação e busca server-side](../../decisions/008-server-side-pagination-search.md)
- [Pattern: Tabela genérica](generic-table.md)
- [Pattern: Hooks React Query por recurso](react-query-resource-hooks.md)

## Status
- **Created**: 2026-04-13
- **Status**: Active
