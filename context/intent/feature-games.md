# Feature: Gestão de jogos

## What
Permite que o administrador mantenha o catálogo de jogos de tabuleiro: listar jogos cadastrados, criar novo jogo com metadados (nome, descrição, preço, faixa etária, número de jogadores, categorias, editoras, artistas, designers, mecanismos), editar jogos existentes, excluir jogos, e cadastrar rapidamente a partir de uma URL externa.

## Why
É a espinha dorsal do site: sem catálogo não há conteúdo nem base para a premiação. O cadastro manual detalhado dá controle editorial; a importação por URL acelera o trabalho quando o jogo já tem ficha pronta em outra fonte.

## Acceptance Criteria
- [x] Lista todos os jogos cadastrados
- [x] Criar jogo com todos os metadados (nome, descrição, preço, jogadores, idade, categorias, editoras, artistas, designers, mecanismos)
- [x] Editar jogo existente pelo id
- [x] Excluir jogo da listagem
- [x] Cadastrar jogo a partir de URL externa (importação via endpoint dedicado)
- [x] Selecionar categorias/editoras/artistas/designers/mecanismos a partir de listas existentes (entidades do catálogo de referências)

## Related
- [Project Intent](project-intent.md)
- [Feature: Catálogo de referências](feature-reference-catalog.md)
- [Decision: Stack tecnológica](../decisions/001-tech-stack.md)
- [Decision: Server state com React Query](../decisions/005-server-state-react-query.md)
- [Decision: Formulários com react-hook-form](../decisions/004-forms-react-hook-form.md)
- [Pattern: Serviço HTTP por recurso](../knowledge/patterns/service-module.md)
- [Pattern: Tabela genérica](../knowledge/patterns/generic-table.md)
- [Pattern: Rotas create/edit compartilhadas](../knowledge/patterns/shared-create-edit-route.md)

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Active (já implementada)
