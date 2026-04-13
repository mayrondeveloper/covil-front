# Changelog

## [Current State] - 2026-04-13 - Context Mesh Added

### Existing Features (documented)
- **Gestão de jogos** — CRUD de jogos, importação por URL, tabela de listagem.
- **Gestão da premiação Dragão de Ouro** — CRUD de edições do prêmio.
- **Categorias da premiação** — cadastro e consulta por edição.
- **Participantes da premiação** — cadastro de indicados por categoria.
- **Votação** — registrar/listar votos; dois fluxos de UI (clássico e "new").
- **Catálogo de referências** — categorias, editoras, artistas, designers, mecanismos.
- **Visualização de resultados** — prêmios por categoria e por colocação.

### Tech Stack (documented)
- React 18 + TypeScript (com arquivos legados em JS)
- Create React App ejetado (webpack 5, scripts customizados em `scripts/`)
- MUI v5 + Emotion + `@mui/x-data-grid`
- Axios 1.x (instância única com interceptor global)
- react-hook-form v7
- react-router-dom v6 com `createBrowserRouter` + lazy loading
- @tanstack/react-query v4
- react-toastify (ToastContainer único e global)
- Yarn 1.22.22 / Node 20.x

### Patterns Identified
- Serviço HTTP por recurso (`src/services/<recurso>-service/`)
- Hook `useCrudForm` para create/edit
- Componente `SimpleNameForm` para entidades com só `{ name }`
- `GenericTable<T>` para listagens simples
- Hooks React Query por recurso (`src/hooks/queries.ts`) + chaves padronizadas em `qk`
- Hook `useNotification` delegando a toast global
- Rotas create/edit compartilham componente, diferenciadas por `:id`
- Todas as rotas lazy-loaded com `Suspense` + fallback e rota 404

### Refactor aplicado antes da documentação (2026-04-13)
- `axios.ts` com interceptor global, validação de `REACT_APP_BASE_PATH`, timeout.
- `ToastContainer` movido para `src/index.tsx` (removido de páginas).
- `React.lazy` + `Suspense` em todas as rotas; rota 404 adicionada.
- Removidas dependências não usadas: FontAwesome, Tailwind, localforage, match-sorter, sort-by.
- Adicionado Prettier (`.prettierrc`, `.prettierignore`) e scripts `lint`, `type-check`, `format`.
- 10 serviços migrados `.js` → `.ts` com tipos em `src/services/types.ts`.
- Hook `useCrudForm` + componente `SimpleNameForm` (5 páginas CRUD reduzidas a ~8 linhas cada).
- `GenericTable` criado; `enchanced-table.tsx` (games) migrado como referência.
- `@tanstack/react-query` adotado (provider + hooks por recurso).
- Testes iniciais: `use-notification.test.ts`, `game-service.test.ts`.

### Redesign visual (2026-04-13)
- Tema MUI editorial em `src/theme/index.ts` (Playfair Display + Inter + JetBrains Mono via `@fontsource/*`; paleta ink + gold + warm background `#FAF7F2`).
- Layout primitives criadas: `PageLayout`, `PageHeader`, `SectionCard` em `src/components/Layout/`.
- Shell `PersistentDrawerLeft` reescrito: drawer permanente em desktop, temporário em mobile, navegação agrupada com ícones e estado ativo gold.
- `GenericTable` refeito (sticky-friendly, hover gold, ações via `IconButton`+`Tooltip`, empty state interno).
- Páginas migradas para o novo shell: `home`, `games`, `add-by-link`, `create-game`, `create-awards`, `dragao-de-ouro`, `award-categories/create`, `award-participants/create`, `votes/create`, `votes/new-votes`, `view-award-and-categories`, `view-award-and-categories-places`, `SimpleNameForm` (com breadcrumb + descrição).
- `EmptyState` simplificado (espaçamento + ilustração discreta).
- Removidos breadcrumbs manuais (Link + ChevronRight) por `<Breadcrumbs>` no `PageHeader`.
- Skill `ui-ux-pro-max` instalada via `uipro init -a claude` (em `.claude/skills/`); recomendações de paleta e tipografia consumidas via `python3 .../search.py --design-system`.

### Decisão a registrar
- Esta mudança merece nova decision em `context/decisions/007-design-system.md` (palette + typography + layout primitives + skill como fonte). ✅ Criada.

### Paginação + busca server-side (2026-04-13)
- `PageParams` ganhou `q?`, `orderBy?`, `order?`. Backend retorna `Paginated<T> = { data, total, page, limit }` em todos os endpoints de listagem.
- Helper `unwrap` em `src/services/pagination.ts`. Cada service expõe `fetchPage(params?)` (paginado) e mantém `fetch()` (legacy, capado em `MAX_LIMIT=200`).
- Novo componente `SearchField` (debounce 350ms, botão limpar). `GenericTable` ganhou prop `toolbar` e `pagination`.
- 7 tabelas migradas: catalog refs, games, awards (Dragão de Ouro), award-categories, award-participants, votes (em ambas as páginas).
- Default rowsPerPage = 10. Votos enviam `orderBy=createdAt&order=desc` (frontend não faz mais `.reverse()`).
- Decision: `008-server-side-pagination-search.md`. Pattern: `search-and-pagination.md`.

### Scoring scheme + ranking backend-driven (2026-04-13)
- Removidos do frontend: `PLACE_POINTS` hardcoded, ranking client-side em winners-overview, lista hardcoded de colocações.
- Novos services: `awards.fetchScoringScheme(id)`, `awards.fetchRanking(awardId, categoryId)`, `awards.addVoters(awardId, voterIds)`.
- Novos hooks: `useScoringScheme`, `useRanking`, `useVoterSlots`.
- Forms de votação carregam `places` dinamicamente do scheme; chips de "X pts" vêm do backend.
- Tela "Vencedores" passou a consumir `/awards/:id/categories/:catId/ranking` direto.
- Tabela de votos mostra `r.value_vote` calculado pelo backend.
- Decision: `009-scoring-scheme-backend-driven.md`. Pattern: `scoring-scheme-consumption.md`.

### Voto duplicado: defesa em duas camadas (2026-04-13)
- UI desabilita opções inválidas usando `useVoterSlots`. `ToggleButton`/`Card` de colocação já usada e options de jogo já votado ficam disabled com tooltip.
- `Asynchronous` ganhou prop `getOptionDisabled` repassada ao Autocomplete do MUI.
- Interceptor axios reconhece 409 com `error: "DUPLICATE_VOTE"` ou `"UNIQUE_CONSTRAINT_VIOLATION"` (lendo `target` ou `conflict`) e formata mensagem amigável.
- Helper `vote-duplicate-check.ts` foi removido (não é mais necessário).
- Decision: `010-vote-duplicate-prevention.md`.

### Outras melhorias (2026-04-13)
- Home com nova área "Votos recentes" (top 5) + stat card de "Votos registrados" total.
- Auto-seleção do prêmio mais recente (por `year` desc) em `winners-overview` e `view-award-and-category-places`.
- Ajuste de cores das medalhas (3º lugar virou bronze/cobre real, antes empatava visualmente com o 1º).
- Wizard `new-votes` totalmente repaginado: progress bar + step indicator, breadcrumb das escolhas, cards clicáveis (substitui Paper+Button), busca + paginação no select de cada passo, confirmação visual com avatares e medalha.
- Página `votes.tsx` com contexto fixado (prêmio + categoria persistem entre votos), summary em tempo real do voto sendo construído, ToggleButtonGroup com medalha por colocação.
- Skill `ui-ux-pro-max` instalada em `.claude/skills/` e usada para guiar o redesign visual.
- Cadastro de participante vincula a múltiplos prêmios via `POST /awards/:id/voters` (`{ id_voters: [...] }`, idempotente, body validado por `AddVotersDto`, resposta `{ added, requested }`).
- 5 tabelas legacy removidas (`enchanced-table`, `-awards`, `-award-participants`, `-award-catgories`, `-awards-categories`, `-awards-categories-place`); só sobrou `enchanced-table-votes` como wrapper fino do `GenericTable`.
- Menu lateral: "Prêmios" agora aponta para `/awards` (lista) e não para o form de criar; lógica de "ativo" só casa rotas explícitas (não pega prefixos demais).
- Mensagens de erro humanas no interceptor para 400/401/403/404/500.

### Upload de imagem (2026-04-13)
- Novo service `src/services/uploads-service/uploads-service.ts` com `upload(file, folder, onProgress)` e `remove(key)`.
- Novo componente reutilizável `src/components/Form/Field/ImageUpload.tsx`:
  - Drop zone com drag & drop ou clique para escolher.
  - Preview da imagem com botões de "Trocar" e "Remover".
  - Barra de progresso durante upload.
  - Modo "Colar URL" como alternativa para casos onde a imagem já está hospedada.
  - Tipo deletes opcional (`deleteOnRemove`) — chama `DELETE /uploads/:key` ao remover.
- Integrado em 3 telas: `create-game.tsx` (capa), `create-award-participants.tsx` (foto), `create-awards.tsx` (banner).
- Interceptor axios reconhece **413** ("Arquivo grande demais. O limite é 5 MB.") e **415** ("Formato não suportado. Use JPG, PNG, WEBP ou GIF.").
- Backend: `POST /uploads` recebe multipart, valida mime/size, processa via sharp (rotate + resize 1024×1024 + webp q80), uuid, sobe no Digital Ocean Spaces. `DELETE /uploads/:key` remove. Resposta `{ url, key, size, mime, width, height }`.

### Suite UX (2026-04-13)
- **`ConfirmDialog`** componente reutilizável (`src/components/ConfirmDialog.tsx`) — substitui dialogs ad-hoc.
- **`useUndoable`** hook (`src/hooks/use-undoable.ts`) — toast com botão "Desfazer" 5s; padrão delete otimista.
- **`useTableUrlState`** hook (`src/hooks/use-table-url-state.ts`) — sincroniza page/limit/q/orderBy/order com `?` da URL.
- Aplicado em todas as tabelas paginadas: games, dragao-de-ouro, award-categories, award-participants, SimpleNameForm, enchanced-table-votes.
- Cada delete: confirmação → toast com undo → commit/revert.
- **Skeleton loading** nas tabelas (`GenericTable.loading`).
- **Avatar colorido por hash** (`src/utils/avatar-color.ts`) — 8 tons soft, aplicado em catálogos + participantes.
- **Wizard de votos**: passo 6 "Voto registrado" com 3 botões pra próximo voto rápido (mesma categoria / mesmo votante / concluir). Chips de breadcrumb movidos pro título.
- **Home com gráficos**: empty states amigáveis; dropdown de edição; Fade stagger nas seções.
- **Busca accent-insensitive** (`src/utils/text.ts`) — wizard + Asynchronous.

### Wizard de votos: melhorias UX (2026-04-13)
- Reordenado para Prêmio → Categoria → Votante → Jogo → Colocação → Confirmar (votante após categoria, pra ter contexto suficiente).
- Botão Voltar limpa o passo de destino + tudo que vier depois.
- Step indicator colapsado em mobile (xs).
- Banner de progresso no step de votante mostra X de Y votos esperados na categoria.
- Votantes que já registraram todas as colocações da categoria aparecem disabled com chip "votos completos".
- `votes.tsx` (form clássico) deletado — só wizard agora.

### Página de anúncio dos vencedores (2026-04-13)
- Nova rota `/awards/:id/announcement` — layout print-friendly.
- Toolbar sticky com "Voltar", "Copiar link" e "Imprimir / Salvar PDF" (`window.print()`).
- CSS `@media print` esconde toolbar, remove sombras.
- Acessível via botão "Página de anúncio" na tela de Vencedores.

### Tabela responsiva (2026-04-13)
- `GenericTable` ganhou `hideOnMobile?: boolean` na coluna.
- Aplicado em colunas secundárias da tabela de jogos e prêmios.

### Clonar edição (2026-04-13)
- Novo `awards.cloneAward(sourceId, options)` chamando `POST /awards/:id/clone`.
- Botão "Clonar" na tabela de prêmios abre dialog com nome/ano + switches (categorias/votantes/jogos).
- Redireciona pra edição da nova edição clonada após sucesso.

### Home com gráficos (2026-04-13)
- Nova dep: `recharts`.
- Componente `HomeCharts` em `src/components/Home/HomeCharts.tsx` mostra 4 cards (Progresso por categoria, Top 5 jogos, Votantes mais ativos, Resumo) baseados na edição mais recente.

### Forms (2026-04-13)
- Novos primitives `ControlledTextField`, `FormRow/FormCol`, `FormActions` em `src/components/Form/Field/` substituem o boilerplate de Controller + TextField + Typography de erro + Box `marginTop: 2`.
- `Asynchronous` reescrito: tipado, sem estado interno duplicado, suporta `required`, exibe erros via `helperText`.
- Páginas refeitas usando os primitives: `create-game.tsx` (3 seções: Identificação / Sessão / Referências, com preview de imagem, ano e preço numéricos com min/max, validação de URL), `create-awards.tsx` (2 seções: Identificação / Vínculos, ano numérico), `create-award-participants.tsx` (defaults `"descrição"`/`"insta"`/`"site"`/`"url"` removidos; só `name` obrigatório; URLs validadas com regex), `create-award-categories.tsx`, `votes.tsx`, `add-by-link.tsx`, `SimpleNameForm`.
- Botões de submit ganharam loading state (`"Salvando…"` + spinner) e bordas/divider consistentes.
- Nova screen: `/awards/winners` mostra vencedores por categoria de uma edição; expone hook `useAwardCategoriesByAward` em `queries.ts`.

---
*Context Mesh adicionado: 2026-04-13*
*Este changelog documenta o estado quando o Context Mesh foi introduzido. Mudanças futuras serão registradas abaixo.*
