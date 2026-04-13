# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn start` — dev server on **port 3001** (`scripts/start.js`, ejected CRA webpack).
- `yarn build` — production build via `scripts/build.js`.
- `yarn test` — Jest via `scripts/test.js`. Run a single test: `yarn test path/to/file.test.tsx` or `yarn test -t "test name"`.
- `yarn test:watch`, `yarn lint`, `yarn lint:fix`, `yarn type-check`, `yarn format`, `yarn format:check`.
- `yarn build:digitalOcean` — CI/deploy build (prod install + rebuild).
- Node `20.x`, yarn `1.22.22` (see `engines`).

## Environment

- `REACT_APP_BASE_PATH` — backend API base URL consumed by `src/services/axios/axios.js`. All service modules use this single `axiosInstance`.

## Architecture

Ejected Create React App (TypeScript + JS mixed) frontend for a board-game / awards admin tool ("Covil dos Jogos" / Dragão de Ouro). No Redux or global state — each page fetches through its own service.

- `src/index.tsx` mounts `RouterProvider` with the route table from `src/router.js`. All routes are declared centrally there; adding a page = add a route entry + page component.
- `src/pages/<domain>/` — one folder per domain entity (`games`, `awards`, `categories`, `publishers`, `artists`, `designers`, `mechanisms`, `award-categories`, `award-participants`, `votes`, `dragao-de-ouro`, `home`). Each typically has `create/` (used for both create and edit via `:id` route param) and sometimes `view/`.
- `src/services/<domain>-service/` — thin axios wrappers, one per backend resource. Always import `axiosInstance` from `src/services/axios/axios.js` rather than constructing new clients.
- `src/components/` — shared UI: `AppBar`, `wrapperDrawer` (page shell/layout), `Form`, `Table`, `CardGame`, `Empty`.
- UI stack: MUI v5 (`@mui/material`, `@mui/x-data-grid`) + Emotion, Tailwind (`tailwindcss` configured), react-hook-form for forms, react-toastify for notifications, FontAwesome + MUI icons.
- Build config lives in `config/` (webpack, jest transforms, paths) and `scripts/` — this is an ejected CRA, so changes to build behavior go there rather than relying on `react-scripts`.

## Design System

- Tema MUI custom em `src/theme/index.ts`. Paleta editorial: primary ink `#111827`, secondary gold `#B45309` (referência ao Dragão de Ouro), background warm `#FAF7F2`. Tipografia: Playfair Display (h1–h3) + Inter (body/UI) + JetBrains Mono. Fontes via `@fontsource/*`.
- Component overrides aplicados globalmente: Button (sem caps, radius 8), Paper (radius 12 + border), AppBar (slim white), Drawer (border-r), Table (header em uppercase letterspaced + hover gold), OutlinedInput, ListItemButton (estado ativo gold).
- Layout primitives:
  - `src/components/Layout/PageLayout.tsx` — wrapper que aplica `PersistentDrawerLeft` + container max-width 1280 + padding generoso.
  - `src/components/Layout/PageHeader.tsx` — eyebrow + título + subtitle + breadcrumbs + actions slot.
  - `src/components/Layout/SectionCard.tsx` — `Paper` com padding consistente, título e descrição.
- Shell em `PersistentDrawerLeft.tsx`: drawer permanente em desktop (≥md), temporário em mobile, menu agrupado (Geral/Catálogo/Premiação/Resultados) com ícones MUI Rounded.
- Princípios UX (do skill ui-ux-pro-max): focus rings visíveis, transitions 200ms, `prefers-reduced-motion` respeitado, hover sem layout shift, contraste WCAG AA.

## Hooks e primitivos compartilhados

- `src/hooks/use-notification.ts` — wrapper em cima de `react-toastify`. `ToastContainer` é montado globalmente em `src/index.tsx`; **não** remontar em páginas.
- `src/hooks/use-crud-form.ts` — padrão de create/edit forms: reset em create, fetch+reset em edit (quando há `id`), toast de sucesso/erro, flags `loading`/`saving`/`isEdit`. Use para novas páginas CRUD.
- `src/components/Form/SimpleNameForm.tsx` — form reutilizável para entidades com só `name` (categories, publishers, artists, designers, mechanisms usam).
- `src/components/Form/Field/ControlledTextField.tsx` — Controller + TextField + helperText/erros automáticos. Sempre preferir a montar Controller manualmente.
- `src/components/Form/Field/FormRow.tsx` (`FormRow` + `FormCol`) — Grid 12-col responsivo para alinhar campos.
- `src/components/Form/Field/FormActions.tsx` — barra de ações padrão (submit + cancel) com loading state, ícone opcional, divider acima.
- `src/components/Form/Input/asynchronous/asynchronous.tsx` — Autocomplete tipado com Controller, exibe erro/`required` e helperText padrão; usa o próprio `field.value` (não duplica estado).
- `src/components/Table/GenericTable.tsx` — tabela genérica tipada com `columns` + `actions` (edit/delete). Preferir para novas tabelas; as `enchanced-table-*` legadas permanecem para callsites que usam multi-select/posicionamento.
- `src/hooks/queries.ts` — hooks React Query por recurso (`useGames`, `useAwards`, `useCategories`, ...). `QueryClientProvider` está em `src/index.tsx`. Preferir esses hooks a fetches manuais com `useEffect`/`useState`.
- `src/services/axios/axios.ts` — `axiosInstance` único com interceptor de erro global (toast automático em falhas HTTP). Serviços usam paths relativos (`/games`), nunca prefixam `baseURL` manualmente.
- `src/services/types.ts` — tipos de domínio compartilhados (`Game`, `Award`, `NamedEntity`, `Id`, ...).

## Conventions

- Routing pattern: create and edit share the same component, distinguished by the presence of an `:id` route param (see `/game/create-game` vs `/game/edit-game/:id` in `router.js`).
- Mix of `.js` and `.tsx` is intentional; match the extension of the surrounding file when editing.
