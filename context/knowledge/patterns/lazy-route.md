# Pattern: Rotas lazy-loaded

## Description
Toda rota é importada via `React.lazy` e envolvida por `<Suspense>` com fallback central. Helper `lazyPage` normaliza imports nomeados vs default.

## When to Use
- Ao adicionar qualquer nova rota.
- Nenhum motivo para importar página top-level — o custo de bundle é sempre desproporcional ao ganho.

## Pattern
- Definir componentes com `lazyPage(() => import("./page"), "NamedExport")`.
- Envolver cada `element` em `withSuspense(...)`.
- Sempre manter a rota `{ path: "*", element: <NotFound /> }` no final.

## Example
```js
// src/router.js
const lazyPage = (importer, named) =>
  lazy(() =>
    importer().then((mod) => ({ default: named ? mod[named] : mod.default }))
  );

const Games = lazyPage(() => import("./pages/games/games"), "Games");

const withSuspense = (element) => (
  <Suspense fallback={<PageFallback />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  { path: "/game", element: withSuspense(<Games />) },
  // ...
  { path: "*", element: <NotFound /> },
]);
```

## Files Using This Pattern
- `src/router.js`

## Related
- [Decision: Roteamento com lazy-loading](../../decisions/002-routing-react-router-lazy.md)

## Status
- **Created**: 2026-04-13
- **Status**: Active
