# Pattern: Consumo do scoring scheme + ranking

## Description
Telas que mostram colocações ou pontos consultam o backend em vez de hardcodar. Três hooks centralizam: `useScoringScheme(awardId)`, `useRanking(awardId, categoryId)` e `useVoterSlots(awardId, categoryId, voterId)`.

## When to Use
- **Forms de votação**: precisa renderizar quais colocações são válidas e mostrar pontos por opção → `useScoringScheme(awardSel.id).places`.
- **Tela de vencedores / rankings**: nunca calcular client-side, sempre `useRanking(awardId, categoryId)`.
- **Pré-validar voto antes do clique**: `useVoterSlots` devolve votos do mesmo (votante × prêmio × categoria) — derive `usedPlaces` e `usedGameIds`.

## Pattern
1. Para colocações dinâmicas: `const places = useScoringScheme(awardId).data?.places ?? []`. Render dos botões/cards itera sobre `places`.
2. Para visual: manter um `PLACE_STYLE: Record<string, ...>` local com gradientes/cores por valor. Helper `styleFor(value)` com fallback genérico para valores desconhecidos.
3. Para ranking: `const { data } = useRanking(awardId, categoryId)`; renderiza `data.ranking.map(entry => ...)` sem cálculo.
4. Para desabilitar opções no form: passa `getOptionDisabled` no `Asynchronous` (jogo) e `disabled` nos botões/cards de colocação, ambos derivados de `usedPlaces`/`usedGameIds`.
5. Para pontos por voto na tabela: usar `r.value_vote` direto da API (calculado no `POST /votes`).

## Example
```tsx
// Forms de voto
const { data: scheme } = useScoringScheme(awardSel?.id);
const places = scheme?.places ?? [];
const { data: voterSlots = [] } = useVoterSlots(awardSel?.id, categorySel?.id, participantSel?.id);
const usedPlaces = new Set(voterSlots.map((v) => String(v.place)));
const usedGameIds = new Set(voterSlots.map((v) => v.id_game ?? v.game?.id));

{places.map((p) => {
  const used = usedPlaces.has(p.value);
  return (
    <ToggleButton value={p.value} disabled={used}>
      {p.label} <Chip label={used ? "usado" : `${p.points} pts`} />
    </ToggleButton>
  );
})}

<Asynchronous
  name="game"
  data={jogos}
  getOptionDisabled={(opt) => usedGameIds.has(opt.id)}
/>
```

```tsx
// Tela de vencedores
const { data } = useRanking(awardId, categoryId);
{data?.ranking.slice(0, 3).map((entry) => (
  <Card>
    <Typography>{entry.position}º — {entry.game.name}</Typography>
    <Typography>{entry.total_points} pontos</Typography>
    <Chip label={`${entry.breakdown.firsts}× 1º`} />
  </Card>
))}
```

## Files Using This Pattern
- `src/hooks/queries.ts` — `useScoringScheme`, `useRanking`, `useVoterSlots`
- `src/services/awards-service/awards-service.ts` — `fetchScoringScheme`, `fetchRanking`, `addVoters`
- `src/pages/votes/create/votes.tsx` — places dinâmicos + slots usados
- `src/pages/votes/create/new-votes.tsx` — wizard com places + slots usados
- `src/pages/awards/view/winners-overview.tsx` — usa ranking pronto
- `src/pages/awards/view/view-award-and-categories.tsx` — usa `value_vote` da API

## Related
- [Decision: Esquema de pontuação backend-driven](../../decisions/009-scoring-scheme-backend-driven.md)
- [Decision: Prevenção de voto duplicado](../../decisions/010-vote-duplicate-prevention.md)

## Status
- **Created**: 2026-04-13
- **Status**: Active
