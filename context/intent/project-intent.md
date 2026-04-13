# Project Intent: Covil dos Jogos — Admin Frontend

## What
Frontend administrativo em React para um site/comunidade de jogos de tabuleiro. Permite cadastro e gestão do catálogo de jogos, além da operação de uma premiação anual ("Dragão de Ouro"): criar edições do prêmio, categorias, participantes, registrar votos e visualizar resultados.

## Why
Centralizar em uma única interface tudo o que é necessário para manter o catálogo de jogos atualizado e operar as etapas de uma premiação (categorias, indicados, apuração) sem exigir acesso direto ao banco de dados nem múltiplas ferramentas.

## Current State
Implementado e em uso. Histórico recente em rajadas:
1. Refactor de infraestrutura — camada HTTP única, React Query, primitivos de CRUD.
2. Redesign visual editorial (tema com Playfair Display + Inter, gold + ink, layout primitives).
3. Forms padronizados via `ControlledTextField` + `FormRow` + `FormActions`.
4. Tabelas com paginação e busca server-side (backend retorna `{ data, total, page, limit }` e aceita `?q=`).
5. Scoring scheme e ranking 100% no backend; frontend só renderiza.
6. Bloqueio na UI de votos duplicados antes do clique + 409 do backend como rede de segurança.
7. Tela "Vencedores" usa `/awards/:id/categories/:catId/ranking` pronto. Home tem stats reais (totais do backend) + lista de votos recentes.
8. Cadastro de participante já vincula a múltiplos prêmios via `POST /awards/:id/voters`.

## Current Features
- [Gestão de jogos](feature-games.md) — catálogo principal, criar/editar/excluir, importar por URL
- [Gestão da premiação Dragão de Ouro](feature-awards.md) — edições do prêmio, CRUD completo
- [Categorias da premiação](feature-award-categories.md)
- [Participantes da premiação](feature-award-participants.md)
- [Votação](feature-votes.md) — registrar e visualizar votos por edição/categoria
- [Catálogo de referências](feature-reference-catalog.md) — categorias, editoras, artistas, designers, mecanismos (entidades auxiliares reutilizadas pelos jogos)
- [Visualização de resultados](feature-awards-view.md) — visualização de prêmios por categoria e por colocação

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Active
- **Note**: Gerado a partir da análise do código existente.
