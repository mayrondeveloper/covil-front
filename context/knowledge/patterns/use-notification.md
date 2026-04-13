# Pattern: Hook useNotification

## Description
Wrapper minimal sobre `react-toastify` que devolve funções memoizadas (`success`, `error`, `info`, `warn`, `notify`). Usado em páginas e em hooks internos (`useCrudForm`). Depende de um único `<ToastContainer>` global montado em `src/index.tsx`.

## When to Use
- Sempre que uma página/hook precisar notificar o usuário.
- **Não** montar `<ToastContainer>` localmente — já existe global.
- **Não** chamar `toast()` direto do `react-toastify` em páginas; usar o hook.

## Pattern
- Importar: `import { useNotification } from "...hooks/use-notification"`.
- Obter as funções: `const { success, error } = useNotification()`.
- Disparar: `success("Cadastro salvo!")`.

## Example
```tsx
// src/pages/games/add-by-link/add-by-link.tsx
import { useNotification } from "../../../hooks/use-notification";

export const AddByLink = () => {
  const { notify } = useNotification();
  // ...
  notify("Jogo cadastrado com sucesso!", "success");
};
```

```ts
// src/hooks/use-notification.ts
export const useNotification = () => {
  const notify = useCallback(
    (message: string, type: TypeOptions = "info") => toast(message, { type }),
    []
  );
  return {
    notify,
    success: useCallback((m: string) => toast.success(m), []),
    error: useCallback((m: string) => toast.error(m), []),
    info: useCallback((m: string) => toast.info(m), []),
    warn: useCallback((m: string) => toast.warn(m), []),
  };
};
```

## Files Using This Pattern
- `src/hooks/use-notification.ts` — definição
- `src/hooks/use-crud-form.ts` — consome `success`/`error`
- `src/pages/games/add-by-link/add-by-link.tsx`
- `src/pages/games/create/create-game.tsx`
- `src/pages/awards/create/create-awards.tsx`

## Related
- [Decision: Notificações centralizadas](../../decisions/006-notifications-toast.md)
- [Decision: Camada HTTP com interceptor global](../../decisions/003-http-axios-interceptor.md)

## Status
- **Created**: 2026-04-13
- **Status**: Active
