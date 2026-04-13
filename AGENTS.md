# AGENTS.md

Instruções para agentes IA trabalhando neste repositório. Projeto usa **Context Mesh** (`context/`) — toda mudança deve ler e atualizar esse contexto.

## Setup Commands

- Install: `yarn install`
- Dev: `yarn start` (porta **3001**)
- Test: `yarn test` (um arquivo: `yarn test path/to/file.test.tsx`; por nome: `yarn test -t "nome"`)
- Test watch: `yarn test:watch`
- Build: `yarn build`
- Lint: `yarn lint` / `yarn lint:fix`
- Type check: `yarn type-check`
- Format: `yarn format` / `yarn format:check`

**Env obrigatória**: `REACT_APP_BASE_PATH` (URL base do backend). Sem isso a UI sobe mas toda chamada HTTP falha silenciosamente.

## Code Style

- TypeScript é o padrão; `.tsx` para componentes. Arquivos `.js`/`.jsx` são legados — **convertê-los ao tocar**, não replicar.
- MUI `sx={{ }}` para estilos. Não usar Tailwind (removido do projeto).
- Services devolvem `Promise<AxiosResponse<T>>`; paths relativos (`/games`), nunca `${baseURL}`.
- Não montar `<ToastContainer>` em página — já existe global. Usar `useNotification`.
- Não usar `useEffect + useState` para fetch — usar hooks de `src/hooks/queries.ts` (React Query).
- Formulários via `react-hook-form` + `Controller` para inputs MUI. Formulários CRUD simples devem usar `useCrudForm` ou `SimpleNameForm`.
- Tabelas novas → `GenericTable<T>`; as `enchanced-table-*` legadas permanecem para casos especiais.
- Rotas novas → `React.lazy` + `Suspense` no `src/router.js`. Create/edit compartilham componente, diferenciados por `:id`.
- Seguir patterns em `@context/knowledge/patterns/`.

## Context Files to Load

Antes de qualquer trabalho, carregar:

- `@context/.context-mesh-framework.md` — regras do framework
- `@context/intent/project-intent.md` — sempre
- `@context/intent/feature-*.md` — o(s) feature(s) relacionado(s) à task
- `@context/decisions/*.md` — decisions relevantes
- `@context/knowledge/patterns/*.md` — patterns aplicáveis
- `@context/knowledge/anti-patterns/README.md` — o que evitar

## Project Structure

```
covil-front/
├── AGENTS.md
├── CLAUDE.md
├── context/
│   ├── .context-mesh-framework.md
│   ├── intent/ (project-intent.md, feature-*.md)
│   ├── decisions/ (001-tech-stack.md, 002..006)
│   ├── knowledge/
│   │   ├── patterns/
│   │   └── anti-patterns/
│   ├── agents/
│   └── evolution/changelog.md
├── src/
│   ├── index.tsx          (bootstrap: ThemeProvider + QueryClientProvider + ToastContainer)
│   ├── router.js          (rotas lazy)
│   ├── hooks/             (use-notification, use-crud-form, queries)
│   ├── services/          (um diretório por recurso, todos .ts)
│   ├── components/        (AppBar, Form, Table, CardGame, Empty, wrapperDrawer)
│   └── pages/             (um diretório por domínio)
├── config/                (webpack, jest — CRA ejetado)
├── scripts/               (start, build, test)
└── package.json
```

## AI Agent Rules

### Sempre
- Carregar o contexto listado acima antes de implementar.
- Seguir decisions em `@context/decisions/` (se uma mudança contradiz uma decision, documentar uma nova decision antes).
- Usar patterns em `@context/knowledge/patterns/`.
- Atualizar contexto após qualquer mudança relevante.

### Nunca
- Ignorar decisions documentadas.
- Aplicar itens listados em `@context/knowledge/anti-patterns/README.md`.
- Deixar contexto desatualizado após mudança.
- Concatenar `baseURL` em serviço, montar `ToastContainer` local, importar rota top-level, ou fazer fetch via `useEffect + useState`.

### Depois de qualquer mudança (crítico)
- Atualizar a feature correspondente (`context/intent/feature-*.md`) se a função mudou.
- Adicionar "Outcomes" à decision se a abordagem divergiu.
- Atualizar `context/evolution/changelog.md`.
- Criar `learning-*.md` em `context/evolution/` se houve aprendizado relevante.
- Se foi introduzida uma nova escolha técnica → criar nova decision.
- Se foi introduzido um novo padrão reutilizável → criar novo pattern.

## Definition of Done (Fase Build)

- [ ] ADR/decision existe antes da implementação (se há escolha técnica nova)
- [ ] Código segue patterns documentados
- [ ] Decisions respeitadas
- [ ] `yarn type-check` passa
- [ ] `yarn test` passa
- [ ] Contexto atualizado (feature/decision/pattern/changelog)
- [ ] Changelog atualizado

---

**Nota**: Este AGENTS.md complementa o `CLAUDE.md` (resumo técnico rápido). Em caso de divergência, este arquivo e o contexto em `@context/` prevalecem.
