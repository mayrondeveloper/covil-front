# Pattern: Formulário simples de nome

## Description
Componente reutilizável para páginas cujo único campo é `name`. Colapsa ~100 linhas de boilerplate (MUI layout + Controller + errors + botão) num componente que recebe apenas `title`, `entityName` e `service`.

## When to Use
- Entidades de catálogo/referência com shape `{ id, name }` (categorias, editoras, artistas, designers, mecanismos).
- Qualquer nova entidade cujo formulário tenha só um campo nome obrigatório.

## Pattern
- Arquivo: `src/components/Form/SimpleNameForm.tsx`.
- Props: `{ title: string; entityName: string; service: CrudService<NamedEntity> }`.
- Internamente usa `useCrudForm<NamedEntity>`.
- Renderiza dentro do `<PersistentDrawerLeft>` (shell padrão do projeto).

## Example
Página completa vira:

```tsx
import * as service from "../../../services/mechanisms-service/mechanisms-service";
import { SimpleNameForm } from "../../../components/Form/SimpleNameForm";

export const CreateMechanisms = () => (
  <SimpleNameForm
    title="Cadastrar mecanismo"
    entityName="Mecanismo"
    service={service}
  />
);
```

## Files Using This Pattern
- `src/components/Form/SimpleNameForm.tsx` — definição
- `src/pages/categories/create/create-categories.tsx`
- `src/pages/publishers/create/create-publishers.tsx`
- `src/pages/artists/create/create-artists.tsx`
- `src/pages/designers/create/create-designers.tsx`
- `src/pages/mechanisms/create/create-mechanisms.tsx`

## Related
- [Pattern: Hook useCrudForm](use-crud-form.md)
- [Decision: Formulários com react-hook-form](../../decisions/004-forms-react-hook-form.md)

## Status
- **Created**: 2026-04-13
- **Status**: Active
