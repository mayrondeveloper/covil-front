# Feature: Votação

## What
Registrar votos de uma edição/categoria da premiação, listar votos existentes (com busca + paginação) e consultar por combinação de edição + categoria. Existem duas experiências:
- **Form clássico** (`/awards/create-votes`) — single-page; prêmio + categoria ficam fixados como contexto, permitindo cadastrar vários votos em sequência.
- **Wizard guiado** (`/awards/create-new-votes`) — cinco passos (Prêmio → Votante → Categoria → Jogo → Colocação → Confirmar) num dialog.

A UI **bloqueia** opções que gerariam voto duplicado (mesmo votante + mesmo place ou mesmo jogo na mesma categoria) antes do clique. Backend tem unique constraints e devolve 409 se algo escapar.

## Why
A premiação precisa computar resultados confiáveis. Votação é o elo entre participantes e ranking final. Bloquear duplicatas no cliente economiza atrito; backend garante integridade.

## Acceptance Criteria
- [x] Registrar voto em uma combinação edição + categoria + votante + jogo + colocação
- [x] Listar todos os votos (paginado server-side, busca server-side, ordenação por mais recente)
- [x] Listar votos por edição + categoria (resultados)
- [x] Remover voto
- [x] Dois fluxos de UI (clássico e wizard)
- [x] Bloquear no UI colocações/jogos já usados pelo mesmo votante naquela edição+categoria
- [x] Mostrar mensagem amigável em caso de 409 do backend
- [x] Pontos por colocação vêm do scoring scheme do prêmio

## Related
- [Project Intent](project-intent.md)
- [Feature: Gestão da premiação](feature-awards.md)
- [Feature: Participantes da premiação](feature-award-participants.md)
- [Feature: Visualização de resultados](feature-awards-view.md)
- [Decision: Esquema de pontuação backend-driven](../decisions/009-scoring-scheme-backend-driven.md)
- [Decision: Prevenção de voto duplicado](../decisions/010-vote-duplicate-prevention.md)
- [Decision: Paginação e busca server-side](../decisions/008-server-side-pagination-search.md)
- [Pattern: Consumo do scoring scheme](../knowledge/patterns/scoring-scheme-consumption.md)
- [Pattern: Busca + paginação server-side](../knowledge/patterns/search-and-pagination.md)
- [Pattern: Primitives de formulário](../knowledge/patterns/form-primitives.md)

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Active (já implementada)
