# Decision: Prevenção de voto duplicado em duas camadas

## Context
Sem proteção, o mesmo votante poderia repetir 1º lugar duas vezes na mesma categoria, ou votar no mesmo jogo em dois places diferentes — quebrando a apuração. O backend agora tem unique constraints `uniq_vote_place` e `uniq_vote_game` que rejeitam com **409** (`UNIQUE_CONSTRAINT_VIOLATION` ou `DUPLICATE_VOTE`, com payload contendo `target` ou `conflict`).

## Decision
Defesa em duas camadas:

1. **UI desabilita opções inválidas antes do clique** — usando `useVoterSlots(awardId, categoryId, voterId)` que devolve os votos que esse votante já tem nesse contexto. Daí derivam-se `usedPlaces` e `usedGameIds`.
   - Nas páginas `votes.tsx` e `new-votes.tsx`, os `ToggleButton`/`Card` de colocação ficam `disabled` se o `place` já foi usado, com chip "usado" e tooltip explicando o porquê.
   - O `Asynchronous` (Autocomplete) de jogo recebe `getOptionDisabled={(opt) => usedGameIds.has(opt.id)}`, exibindo opções já votadas em cinza.
2. **Backend é a fonte de verdade** — se algo escapa (corrida, cache antigo), o **interceptor axios** (`src/services/axios/axios.ts`) reconhece 409 com `error: "DUPLICATE_VOTE"` ou `error: "UNIQUE_CONSTRAINT_VIOLATION"` e formata mensagem clara para o usuário ("Voto duplicado: este votante já registrou Xº lugar nesta categoria…"). O `target` (array de colunas) é inspecionado quando `conflict` não vem explícito.

## Rationale
- Camada 1 é UX puro: o usuário não chega a tentar uma operação que vai falhar.
- Camada 2 é segurança: integridade não pode depender da boa intenção do cliente. O DB é o último a falar.
- Mensagem amigável centralizada no interceptor → todas as páginas se beneficiam sem repetir lógica.

## Alternatives Considered
- **Só backend (mostrar erro depois do clique)**: UX ruim, especialmente em wizard guiado.
- **Só frontend (sem unique no DB)**: vulnerável a bug/race condition.
- **Bloquear via React Query mutation onError**: funciona mas duplica lógica em cada página; o interceptor é mais DRY.

## Outcomes
- Helper `vote-duplicate-check.ts` foi removido — não é mais necessário fazer pre-check porque o `useVoterSlots` já alimenta a UI direto.
- Mensagens 409 padronizadas no interceptor (também trata 400/401/403/404/500 com mensagens humanas).

## Related
- [Project Intent](../intent/project-intent.md)
- [Feature: Votação](../intent/feature-votes.md)
- [Decision: Camada HTTP com interceptor global](003-http-axios-interceptor.md)
- [Decision: Esquema de pontuação backend-driven](009-scoring-scheme-backend-driven.md)

## Status
- **Created**: 2026-04-13 (Phase: Build)
- **Status**: Accepted
