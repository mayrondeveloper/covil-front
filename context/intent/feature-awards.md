# Feature: Gestão da premiação Dragão de Ouro

## What
Permite criar, editar, listar e excluir edições do prêmio "Dragão de Ouro". Cada prêmio possui nome e está associado a categorias, participantes e votos. Edições existentes podem ser retomadas para ajuste.

## Why
A premiação é um dos principais eixos editoriais do projeto. Precisa de uma área própria de gestão porque seu ciclo de vida (criação → categorização → participação → votação → apuração) é distinto do cadastro cotidiano do catálogo de jogos.

## Acceptance Criteria
- [x] Criar nova edição do prêmio
- [x] Editar edição existente pelo id
- [x] Listar edições cadastradas (tela Dragão de Ouro)
- [x] Excluir edição
- [x] Relacionar edição a categorias e participantes já cadastrados

## Related
- [Project Intent](project-intent.md)
- [Feature: Categorias da premiação](feature-award-categories.md)
- [Feature: Participantes da premiação](feature-award-participants.md)
- [Feature: Votação](feature-votes.md)
- [Feature: Visualização de resultados](feature-awards-view.md)
- [Decision: Formulários com react-hook-form](../decisions/004-forms-react-hook-form.md)
- [Pattern: Rotas create/edit compartilhadas](../knowledge/patterns/shared-create-edit-route.md)

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Active (já implementada)
