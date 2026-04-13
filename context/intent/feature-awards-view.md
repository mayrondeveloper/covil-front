# Feature: Visualização de resultados

## What
Três telas de consulta:
- **`/awards/winners`** — vencedores por categoria de uma edição. Usa o endpoint `/ranking` (backend pronto). Mostra top 3 por categoria com medalhas (ouro/prata/bronze) e detalhamento (Xx 1º, Yx 2º, Zx 3º).
- **`/awards/view-award-and-category`** — lista bruta de votos para um filtro prêmio + categoria, com pontos individuais (`value_vote` da API).
- **`/awards/view-award-and-category-places`** — visualização por colocação (jogos vencedores em cada lugar).

A edição mais recente é pré-selecionada automaticamente em `winners` e `view-award-and-category-places`.

## Why
Operadores precisam conferir o estado da apuração antes de divulgar resultados, com confiança de que os pontos exibidos batem com o cálculo oficial do servidor.

## Acceptance Criteria
- [x] Selecionar prêmio (auto-seleciona o mais recente)
- [x] Mostrar ranking por categoria (top 3 com medalhas)
- [x] Mostrar detalhamento de votos por colocação (Xx 1º, Yx 2º, Zx 3º)
- [x] Mostrar votos individuais com pontos calculados pelo backend
- [x] Sem cálculo de ranking no frontend (vem pronto da API)

## Related
- [Project Intent](project-intent.md)
- [Feature: Gestão da premiação](feature-awards.md)
- [Feature: Votação](feature-votes.md)
- [Decision: Esquema de pontuação backend-driven](../decisions/009-scoring-scheme-backend-driven.md)
- [Pattern: Consumo do scoring scheme](../knowledge/patterns/scoring-scheme-consumption.md)

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Active (já implementada)
