# Feature: Catálogo de referências

## What
Cadastros auxiliares reutilizados pelos jogos: **categorias**, **editoras (publishers)**, **artistas**, **designers** e **mecanismos**. Cada um tem CRUD completo (criar, editar inline, excluir com confirmação) numa única tela com tabela paginada + busca server-side.

## Why
Padronizar nomes evita duplicação ("Editora Galápagos" vs "Galapagos Jogos") e permite filtros consistentes. Tela unificada (form em cima, lista embaixo) acelera a operação de adicionar muitos itens em sequência.

## Acceptance Criteria
- [x] Cadastrar entidade com campo "nome"
- [x] Listar paginado com busca server-side
- [x] Editar inline (ao clicar em editar, o form recebe os valores; botão muda para "Salvar alterações")
- [x] Excluir com diálogo de confirmação
- [x] Reutilização: a mesma entidade é referenciada por múltiplos jogos via `id_*` arrays

## Related
- [Project Intent](project-intent.md)
- [Feature: Gestão de jogos](feature-games.md)
- [Decision: Paginação e busca server-side](../decisions/008-server-side-pagination-search.md)
- [Pattern: Formulário simples de nome](../knowledge/patterns/simple-name-form.md)
- [Pattern: Hook useCrudForm](../knowledge/patterns/use-crud-form.md)
- [Pattern: Busca + paginação server-side](../knowledge/patterns/search-and-pagination.md)
- [Pattern: Serviço HTTP por recurso](../knowledge/patterns/service-module.md)

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Active (já implementada)
