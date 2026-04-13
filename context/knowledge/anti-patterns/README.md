# Anti-patterns

Padrões a **evitar** neste projeto. Crie um arquivo por anti-pattern quando identificar um jeito comum de resolver algo que este projeto rejeita (com explicação do porquê).

## Conhecidos (descobertos no refactor 2026-04-13)

- **Concatenar `${baseURL}` em serviços**: `axiosInstance` já tem `baseURL`. Usar path relativo.
- **Montar `<ToastContainer>` em páginas**: já existe um global em `src/index.tsx`.
- **`useEffect + useState` para fetch**: usar hooks de `src/hooks/queries.ts` (React Query).
- **`.catch((e) => console.log(e))`**: o interceptor global já notifica o usuário; silenciar erro engana quem depura.
- **`setLoading(true)` sem usar o valor**: sinal de código morto copiado.
- **Re-escrever formulário "cadastrar X com nome"**: usar `SimpleNameForm`.
- **Importar rota top-level**: sempre via `React.lazy`.
- **Hardcodar pontos por colocação no frontend** (5/3/1, etc.): vem do `useScoringScheme(awardId)` ou do `value_vote` que cada voto traz. A regra é do backend.
- **Calcular ranking no frontend**: nunca. Usar `useRanking(awardId, categoryId)` que devolve `{ ranking, position, total_points, breakdown, voters }`.
- **`.reverse()` em lista paginada**: quebra entre páginas. Use `orderBy=createdAt&order=desc` no fetchPage.
- **`fetch + update` para anexar item a collection**: se houver endpoint dedicado (ex.: `POST /awards/:id/voters`), use. É atômico e idempotente.
- **Pré-validar voto duplicado com query manual**: use `useVoterSlots(awardId, categoryId, voterId)` e desabilite as opções inválidas. Backend ainda é a fonte de verdade via 409.
- **Montar `Controller + TextField + Typography de erro`**: use `ControlledTextField`.
- **Misturar busca client-side com paginação server-side**: confunde UX. Toda busca em listagem paginada é server-side via `?q=`.
