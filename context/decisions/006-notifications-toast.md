# Decision: Notificações centralizadas com react-toastify

## Context
Antes do refactor, cada página definia sua própria função `notify` sobre `toast()` do `react-toastify` e montava um `<ToastContainer>` local. Toasts só apareciam nas páginas que lembravam de montar o container; mensagens do interceptor HTTP não tinham lugar para serem exibidas.

## Decision
- Um único `<ToastContainer position="top-right" autoClose={4000} />` montado em `src/index.tsx`, dentro do `ThemeProvider` e do `QueryClientProvider`.
- Hook `useNotification` em `src/hooks/use-notification.ts` exporta `{ notify, success, error, info, warn }` memoizados.
- Páginas consomem o hook; interceptor axios e `useCrudForm` também usam toast direto.

## Rationale
- Um container global garante que qualquer disparo de toast apareça, independentemente da rota/página.
- Hook dá ponto único para evoluir (ex.: trocar biblioteca, adicionar logging) sem caçar chamadas.
- `toastId` estável no interceptor (por status HTTP) evita spam em cascatas de falhas.

## Alternatives Considered
- **MUI Snackbar**: exigiria gerenciar fila/estado manualmente; toastify resolve out-of-the-box.
- **Notistack**: alternativa sólida; toastify foi mantido para não introduzir nova dependência.

## Outcomes
- Containers locais removidos de `create-game.tsx`, `create-awards.tsx`, `add-by-link.tsx`.

## Related
- [Project Intent](../intent/project-intent.md)
- [Decision: Camada HTTP com interceptor global](003-http-axios-interceptor.md)
- [Pattern: Hook useNotification](../knowledge/patterns/use-notification.md)

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Accepted
