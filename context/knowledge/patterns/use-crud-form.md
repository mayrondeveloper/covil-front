# Pattern: Hook useCrudForm

## Description
Hook genérico que encapsula o padrão repetido de formulários create/edit: `useForm` do react-hook-form + fetch inicial em modo edit + submit chamando `create`/`update` + toast + reset. Retorna a API do `useForm` estendida com `submit`, `loading`, `saving` e `isEdit`.

## When to Use
- Formulário CRUD novo com entidade simples/média.
- Páginas que fazem create **e** edit compartilhando o mesmo componente (padrão do projeto, ver pattern `shared-create-edit-route`).

Não usar quando:
- A página precisa disparar múltiplos fetches para popular selects assíncronos com transformações específicas — nesse caso o custo de forçar o hook pode superar o ganho (ver `create-game.tsx`, `create-awards.tsx` como exemplos mantidos fora).

## Pattern
1. O serviço passado precisa implementar `CrudService<T>`: `create` obrigatório; `fetchOne` e `update` opcionais (necessários para edit).
2. Obter `id` via `useParams()` e repassar; o hook decide `isEdit`.
3. Usar `handleSubmit(submit)` no `<form>`.
4. Usar `saving` para desabilitar o botão de envio.
5. Mapear o payload do backend para o shape do formulário via `mapToForm` se divergir.

## Example
```tsx
// src/pages/categories/create/create-categories.tsx
import * as service from "../../../services/categories-service/categories-service";
import { SimpleNameForm } from "../../../components/Form/SimpleNameForm";

export const CreateCategories = () => (
  <SimpleNameForm
    title="Cadastrar categoria"
    entityName="Categoria"
    service={service}
  />
);
```

Uso direto do hook (quando não se usa `SimpleNameForm`):

```tsx
const { handleSubmit, control, formState: { errors }, submit, saving, isEdit } =
  useCrudForm<Award>({
    service,
    id: params.id,
    defaultValues: { name: "" } as Award,
    entityName: "Prêmio",
  });

<form onSubmit={handleSubmit(submit)}>
  {/* Controllers ... */}
  <Button type="submit" disabled={saving}>
    {isEdit ? "Atualizar" : "Enviar"}
  </Button>
</form>
```

## Files Using This Pattern
- `src/hooks/use-crud-form.ts` — definição
- `src/components/Form/SimpleNameForm.tsx` — consumidor genérico
- `src/pages/categories/create/create-categories.tsx`
- `src/pages/publishers/create/create-publishers.tsx`
- `src/pages/artists/create/create-artists.tsx`
- `src/pages/designers/create/create-designers.tsx`
- `src/pages/mechanisms/create/create-mechanisms.tsx`

## Related
- [Decision: Formulários com react-hook-form](../../decisions/004-forms-react-hook-form.md)
- [Pattern: Formulário simples de nome](simple-name-form.md)
- [Pattern: Hook useNotification](use-notification.md)

## Status
- **Created**: 2026-04-13
- **Status**: Active
