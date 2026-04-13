# Pattern: Tabela genérica

## Description
Componente `GenericTable<T>` em `src/components/Table/GenericTable.tsx` que recebe `data`, `columns` (header + render) e `actions` (edit/delete ou ícone custom). Substitui o padrão anterior de criar uma tabela específica por recurso.

## When to Use
- Listagem simples com colunas textuais e ações por linha (editar, excluir).
- Preferir para tabelas novas. Tabelas legadas `enchanced-table-*.tsx` que envolvem multi-select/posicionamento/checkbox permanecem específicas.

## Pattern
- `columns: TableColumn<T>[]` — cada item com `header`, `align`, `render(row)`.
- `actions: TableAction<T>[]` — cada item com `icon: "edit" | "delete" | React.ReactNode`, `color`, `onClick(row)`, `header?`.
- `rowKey: (row: T) => string | number` — obrigatório.
- Linha vazia automática com `emptyMessage`.

## Example
```tsx
// src/components/Table/enchanced-table/enchanced-table.tsx
<GenericTable<Game>
  data={data ?? []}
  rowKey={(g) => g.id}
  columns={[
    { header: "Jogo", render: (g) => g.name },
    { header: "Descrição", align: "right", render: (g) => (g as any).description },
    { header: "Preço", align: "right", render: (g) => (g as any).price },
    { header: "Categoria", align: "right", render: (g) => joinNames(g.categories) },
    { header: "Editora", align: "right", render: (g) => joinNames(g.publishers) },
  ]}
  actions={[
    { icon: "edit", color: "primary", onClick: editarJogo, header: "Editar" },
    { icon: "delete", color: "warning", onClick: excluirJogo, header: "Excluir" },
  ]}
/>
```

## Files Using This Pattern
- `src/components/Table/GenericTable.tsx` — definição
- `src/components/Table/enchanced-table/enchanced-table.tsx` — listagem de jogos

## Related
- [Feature: Gestão de jogos](../../intent/feature-games.md)
- [Decision: Stack tecnológica](../../decisions/001-tech-stack.md)

## Status
- **Created**: 2026-04-13
- **Status**: Active
