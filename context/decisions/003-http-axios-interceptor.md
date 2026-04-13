# Decision: Camada HTTP com Axios + interceptor global

## Context
Antes do refactor, cada serviço duplicava `baseURL = process.env.REACT_APP_BASE_PATH` e tratava erros com `.catch(console.log)`. Isso dispersava a URL base, silenciava falhas para o usuário e tornava impossível adicionar políticas globais (timeout, retry, auth).

## Decision
- Uma instância única `axiosInstance` em `src/services/axios/axios.ts` com `baseURL` lida do `REACT_APP_BASE_PATH` e `timeout: 30000`.
- Validação da env var no boot: se vazia, log de erro.
- `interceptors.response` global que rejeita erros e dispara `toast.error(...)` com mensagem derivada do status HTTP (usa `toastId` estável por status para evitar duplicatas). Desabilitado em `NODE_ENV === "test"`.
- Todos os serviços importam `axiosInstance` e usam paths relativos (`/games`, `/awards`, ...). Nenhum serviço concatena `baseURL` manualmente.

## Rationale
- Centralizar interceptor permite evoluir políticas de erro/auth/retry num único ponto.
- `toastId` por status evita que uma cascata de falhas gere dezenas de toasts.
- `timeout` evita requests pendurados indefinidamente.
- Validar env cedo dá feedback claro em vez de `baseURL` silenciosamente `undefined`.

## Alternatives Considered
- **Fetch nativo**: rejeitado — sem interceptors, sem `baseURL` nativo, mais verboso.
- **TanStack Query fetcher sem axios**: possível no futuro, mas axios já estava estabelecido e simplifica tipagem com `AxiosResponse<T>`.
- **Tratamento de erro dentro de cada service**: mantém duplicação e esquecimentos.

## Outcomes
- Serviços migrados para TS com tipos `AxiosResponse<T>`, URLs normalizadas.
- `ToastContainer` movido para `src/index.tsx` (global) para que toasts do interceptor apareçam em qualquer rota.

## Related
- [Project Intent](../intent/project-intent.md)
- [Decision: Stack tecnológica](001-tech-stack.md)
- [Decision: Notificações centralizadas](006-notifications-toast.md)
- [Decision: Server state com React Query](005-server-state-react-query.md)
- [Pattern: Serviço HTTP por recurso](../knowledge/patterns/service-module.md)

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Accepted
