# Pattern: Rotas create/edit compartilhadas

## Description
Create e edit de uma mesma entidade renderizam o **mesmo componente**, diferenciados apenas pela presença do parâmetro `:id` na URL. O componente decide o modo via `useParams()`.

## When to Use
- Entidade tem formulário idêntico para cadastro e edição.
- Ao adicionar CRUD novo, sempre seguir este padrão.

## Pattern
- Declarar duas rotas no `src/router.js` apontando para o mesmo componente:
  - `/<recurso>/create-<recurso>` (sem id)
  - `/<recurso>/edit-<recurso>/:id`
- Dentro do componente: `const { id } = useParams();` → passar para `useCrudForm({ id, ... })`.
- O hook/página distingue "edit" de "create" pela presença do id e popula o form com `fetchOne`.

## Example
```js
// src/router.js
{ path: "/game/create-game", element: withSuspense(<CreateGame />) },
{ path: "/game/edit-game/:id", element: withSuspense(<CreateGame />) },
{ path: "/awards/create-awards", element: withSuspense(<CreateAwards />) },
{ path: "/awards/edit-awards/:id", element: withSuspense(<CreateAwards />) },
```

```tsx
// página
const params = useParams();
const { submit, isEdit } = useCrudForm<Award>({
  service,
  id: params.id,
  defaultValues: { name: "" } as Award,
  entityName: "Prêmio",
});
```

## Files Using This Pattern
- `src/router.js`
- `src/pages/games/create/create-game.tsx`
- `src/pages/awards/create/create-awards.tsx`

## Related
- [Decision: Roteamento com lazy-loading](../../decisions/002-routing-react-router-lazy.md)
- [Pattern: Hook useCrudForm](use-crud-form.md)

## Status
- **Created**: 2026-04-13
- **Status**: Active
