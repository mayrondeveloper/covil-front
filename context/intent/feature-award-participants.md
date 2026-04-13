# Feature: Participantes da premiação

## What
Cadastro dos participantes/indicados, com listagem paginada + busca, edição de dados, remoção e **vínculo direto a uma ou mais edições do prêmio** já no momento do cadastro (multi-select de prêmios opcional). Cada participante tem nome, descrição, imagem, instagram, site e URL do canal.

## Why
A apuração só faz sentido com indicados formalmente registrados por categoria. Vincular ao prêmio no mesmo formulário evita o passo extra de "criar e depois ir editar o prêmio". Links sociais ajudam a divulgar o conteúdo do indicado.

## Acceptance Criteria
- [x] Criar participante com nome (obrigatório), descrição, imagem, instagram, site, URL
- [x] Listar paginado com busca server-side
- [x] Remover participante
- [x] Vincular o novo participante a múltiplos prêmios via `POST /awards/:id/voters` (append-only, idempotente)
- [x] Tratar erros parciais (alguns vínculos falharem) sem perder o cadastro do participante
- [x] Validar URLs com regex

## Related
- [Project Intent](project-intent.md)
- [Feature: Gestão da premiação](feature-awards.md)
- [Feature: Votação](feature-votes.md)
- [Decision: Paginação e busca server-side](../decisions/008-server-side-pagination-search.md)
- [Pattern: Primitives de formulário](../knowledge/patterns/form-primitives.md)
- [Pattern: Busca + paginação server-side](../knowledge/patterns/search-and-pagination.md)

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Active (já implementada)
