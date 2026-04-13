# Decision: Formulários com react-hook-form + useCrudForm

## Context
Várias páginas têm o mesmo padrão: `useForm` + `defaultValues` + `handleSubmit` + fetch inicial (em edit) + toast de sucesso + reset. Antes do refactor, isso era reescrito em cada página, com `setLoading` declarado mas ignorado e sem validação.

## Decision
- Usar `react-hook-form` v7 com `Controller` para campos MUI.
- Extrair um hook `useCrudForm<T>` (`src/hooks/use-crud-form.ts`) que encapsula: `useForm`, fetch inicial via `service.fetchOne` quando há `id`, submit que chama `create` ou `update`, reset automático em create, toast de sucesso/erro e flags `loading` / `saving` / `isEdit`.
- Para entidades que só têm `{ name }` (referências: categorias, editoras, artistas, designers, mecanismos), usar o componente `SimpleNameForm` em vez de reescrever o formulário inteiro.
- Páginas com lógica específica (múltiplos selects assíncronos, ex.: `create-game`, `create-awards`) permanecem com `useForm` direto — adotar `useCrudForm` é opcional.

## Rationale
- react-hook-form tem overhead mínimo, integra com MUI via `Controller`, e já é usado em todas as páginas existentes.
- `useCrudForm` elimina 30–80 linhas duplicadas por página CRUD simples.
- Manter páginas complexas fora do hook evita forçar abstração em casos que não encaixam.

## Alternatives Considered
- **Formik**: maior overhead, API menos ergonômica com MUI.
- **Uncontrolled forms + FormData**: perde validação e integração com MUI controlado.
- **zod + @hookform/resolvers**: cogitado para validação declarativa; não adotado neste refactor (regras `required` simples são suficientes hoje). Decisão pendente para próxima iteração.

## Outcomes
- Páginas de referência reduzidas a ~8 linhas cada via `SimpleNameForm`.
- `useCrudForm` disponível para adoção incremental em páginas maiores.

## Related
- [Project Intent](../intent/project-intent.md)
- [Feature: Catálogo de referências](../intent/feature-reference-catalog.md)
- [Feature: Gestão de jogos](../intent/feature-games.md)
- [Feature: Gestão da premiação](../intent/feature-awards.md)
- [Pattern: Hook useCrudForm](../knowledge/patterns/use-crud-form.md)
- [Pattern: Formulário simples de nome](../knowledge/patterns/simple-name-form.md)

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Accepted
