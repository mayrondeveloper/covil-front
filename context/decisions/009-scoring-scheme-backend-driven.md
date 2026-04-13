# Decision: Esquema de pontuação e ranking vêm do backend

## Context
A escala de pontos por colocação (1º=5, 2º=3, 3º=1) e a ordem dos desempates estavam codificadas no frontend em múltiplos lugares (`PLACE_POINTS`, lógica em `winners-overview.tsx`, lista `colocacoes` em `data.ts`). Risco real de divergência se a regra mudasse, e a ranking computada client-side não escala (precisaria buscar todos os votos por categoria).

## Decision
- **Fonte única de verdade no backend**:
  - `GET /awards/:id/scoring-scheme` → `{ places: [{ value, label, points }], tiebreakers, rules }`. Default 5/3/1 quando não customizado; pode ser sobrescrito via `PUT /awards/:id` com `scoring_scheme`.
  - `GET /awards/:awardId/categories/:categoryId/ranking` → `{ ranking: [{ position, game, total_points, breakdown, voters }] }`. Backend calcula ordenação + desempates via `RankingService`.
  - `POST /votes` calcula `value_vote` automaticamente via `pointsForPlace(scheme, place)`. Rejeita 400 se `place` não está no scheme.
- **Hooks no frontend** (em `src/hooks/queries.ts`):
  - `useScoringScheme(awardId)` — cache 5min.
  - `useRanking(awardId, categoryId)` — cache 30s.
  - `useVoterSlots(awardId, categoryId, voterId)` — votos já existentes do votante naquele contexto, para a UI desabilitar opções.
- **Frontend mantém apenas decisão visual** — `PLACE_STYLE` (gradientes/cores por valor de colocação) em cada página de votação. Rótulos, valores válidos e pontos vêm do scheme.
- **Tela `winners-overview.tsx`** consome o ranking pronto. Sem cálculo no client.
- **Tabela de votos** (`view-award-and-categories.tsx`) mostra `r.value_vote` direto da API (não recalcula).

## Rationale
- Eliminar a duplicação evita bugs de "frontend mostra X pontos, backend calcula Y".
- Premiações futuras podem usar escalas diferentes (ex.: 10/5/2, ou incluir 4º lugar) sem mexer no código.
- Ranking server-side aproveita queries eficientes do Prisma e dá um shape consistente para qualquer consumidor (incluindo futura view pública).

## Alternatives Considered
- **Manter pontos no frontend e só sincronizar com backend**: dois lugares pra atualizar = bug garantido.
- **Backend devolve só os votos brutos, frontend ranqueia**: forçaria toda UI a re-implementar o ranking; não escala se houver outro consumidor.
- **Cor/ícone por colocação no backend também**: overkill — visual é responsabilidade da camada de UI.

## Outcomes
- Removidos do frontend: `PLACE_POINTS`, ranking client-side em winners-overview, lista hardcoded de colocações.
- Forms de votação carregam `places` dinamicamente via `useScoringScheme(awardSel.id)`. Chip "X pts" em cada opção mostra os pontos atuais do scheme.
- Tela "Pontos" da tabela de votos agora mostra `value_vote` calculado pelo backend.

## Related
- [Project Intent](../intent/project-intent.md)
- [Feature: Votação](../intent/feature-votes.md)
- [Feature: Visualização de resultados](../intent/feature-awards-view.md)
- [Pattern: Consumo do scoring scheme](../knowledge/patterns/scoring-scheme-consumption.md)

## Status
- **Created**: 2026-04-13 (Phase: Build)
- **Status**: Accepted
