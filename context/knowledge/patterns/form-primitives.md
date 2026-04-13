# Pattern: Primitives de formulário

## Description
Conjunto de componentes em `src/components/Form/Field/` que substitui o boilerplate `Controller + TextField + Typography de erro + Box marginTop`. Forms ficam declarativos e consistentes em validação, erros, layout e botões.

## When to Use
- Sempre que um form for criado/refatorado.
- Não montar `<Controller>` + `<TextField>` + bloco de erro manual — use `ControlledTextField`.
- Não montar `<Stack>` ad-hoc para alinhar campos — use `FormRow` + `FormCol`.
- Não criar botão "Salvar" manualmente — use `FormActions`.

## Pattern
- **`ControlledTextField`** — wrapper que recebe `control`, `name`, `rules`. Mensagens de erro automáticas por tipo (`required`, `minLength`, `min`, `max`, `pattern`). Helper text vai pra `helperText` (`" "` por default para reservar espaço e evitar layout shift).
- **`FormRow` + `FormCol`** — Grid 12-col responsivo com gap padrão. `<FormCol md={6}>` ocupa metade no desktop.
- **`FormActions`** — barra com submit (loading state + spinner + ícone), cancel opcional, divider acima. Aceita `submitLabel`, `submitIcon`, `savingLabel`.
- **`SearchField`** — input com lupa, debounce 350ms e botão de limpar. Renderizado dentro do `toolbar` do `GenericTable`.
- **`ImageUpload`** — drop zone + preview + progresso + fallback "Colar URL". Encaixa em `react-hook-form` via `<Controller>`. Aceita `folder` (`games|participants|awards|misc`), `deleteOnRemove` (chama `DELETE /uploads/:key` ao remover).

## Example
```tsx
<form onSubmit={handleSubmit(onSubmit)} noValidate>
  <FormRow>
    <FormCol md={6}>
      <ControlledTextField
        control={control}
        name="name"
        label="Nome"
        required
        rules={{ required: true, minLength: { value: 2, message: "Nome muito curto" } }}
        placeholder="Ex.: Wingspan"
      />
    </FormCol>
    <FormCol md={6}>
      <ControlledTextField
        control={control}
        name="image"
        label="URL da imagem"
        rules={{ pattern: { value: URL_REGEX, message: "Use http(s)://" } }}
      />
    </FormCol>
  </FormRow>
  <FormActions
    submitLabel={isEdit ? "Salvar alterações" : "Cadastrar"}
    saving={saving}
    onCancel={() => navigate(-1)}
  />
</form>
```

## Files Using This Pattern
- `src/components/Form/Field/ControlledTextField.tsx` — definição
- `src/components/Form/Field/FormRow.tsx` — definição
- `src/components/Form/Field/FormActions.tsx` — definição
- `src/components/Form/Field/SearchField.tsx` — definição
- `src/components/Form/SimpleNameForm.tsx` — usa todos
- `src/pages/games/create/create-game.tsx` — usa em 3 seções
- `src/pages/awards/create/create-awards.tsx` — usa em 2 seções
- `src/pages/award-categories/create/create-award-categories.tsx`
- `src/pages/award-participants/create/create-award-participants.tsx`
- `src/pages/games/add-by-link/add-by-link.tsx`
- `src/pages/votes/create/votes.tsx`

## Related
- [Decision: Formulários com react-hook-form](../../decisions/004-forms-react-hook-form.md)
- [Decision: Design system editorial](../../decisions/007-design-system.md)
- [Pattern: Hook useCrudForm](use-crud-form.md)

## Status
- **Created**: 2026-04-13
- **Status**: Active
