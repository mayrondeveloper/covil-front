# Decision: Design system editorial (Playfair + Inter, paleta ink+gold)

## Context
O visual original era genérico (palette grey/orange default do MUI, tipografia Roboto, paddings apertados, breadcrumbs manuais como `<Link><ChevronRight/></Link>`). O usuário pediu redesign de todas as páginas, paleta livre, foco desktop, layout mais arejado. A skill `ui-ux-pro-max` (instalada via `uipro init -a claude` em `.claude/skills/ui-ux-pro-max/`) foi consultada para fundamentar escolhas de paleta, tipografia, anti-patterns e checklist de qualidade.

## Decision
Adotar um **design system editorial-administrativo** com referência ao Dragão de Ouro:

- **Paleta**: primary ink `#111827` (slate-900), secondary gold `#B45309` (amber-700), background warm `#FAF7F2`, surface branco, border `#E5E0D6`. Success emerald, error ruby.
- **Tipografia**: Playfair Display (h1–h3, eyebrow display) + Inter (body, UI, h4–h6) + JetBrains Mono (números/ids). Carregadas via `@fontsource/*` (não Google Fonts CDN).
- **Spacing**: base 8px MUI; padding generoso de página (px 5, py 6 em desktop), max-width 1280, card padding 32–40.
- **Shape**: radius 12 (cards/papers), 8 (botões/inputs), 6 (chips), 24 (drawer items).
- **Component overrides** (em `src/theme/index.ts`): Button (sem caps, radius 8, hover sem shift), Paper/Card (radius 12 + border, sem elevation default), AppBar (slim white com border-b), Drawer (border-r), Table (header em uppercase letterspaced, hover row em gold a 4%), OutlinedInput (radius 8, focus gold), ListItemButton (estado selecionado em gold a 10%).
- **Layout primitives**: `PageLayout` (shell + container max-width), `PageHeader` (eyebrow + h2 + subtitle + breadcrumbs + actions), `SectionCard` (Paper com título e descrição). Páginas devem compor sobre esses primitivos em vez de reconstruir Box/Paper/breadcrumb manualmente.
- **Shell** (`PersistentDrawerLeft`): drawer permanente em desktop (≥md, 264px), temporário em mobile, navegação agrupada (Geral / Catálogo / Premiação / Resultados) com ícones MUI Rounded e estado ativo gold.
- **Acessibilidade/UX**: focus ring gold em `*:focus-visible`, transições 150–250ms, `prefers-reduced-motion` desativa animações via override no CssBaseline, contraste WCAG AA mínimo no body (`#0F172A` em `#FAF7F2` = ~16:1).

## Rationale
- Skill recomendou *Classic Elegant* (Playfair + Inter) quando a query incluiu "editorial". Combina com a natureza editorial da premiação Dragão de Ouro sem perder a sobriedade administrativa.
- Gold como secondary referencia o nome do prêmio sem cair em laranja saturado padrão MUI; ink em vez de cinza puro dá mais peso editorial ao texto.
- Background warm off-white (em vez de branco puro) reduz fadiga em uso prolongado e remete ao papel impresso.
- Layout primitives evitam que cada página reinvente shell, breadcrumb, padding — elimina inconsistências entre as ~13 páginas e reduz LOC nas páginas simples para <80 linhas.
- `@fontsource/*` em vez de CDN do Google Fonts: zero dependência de rede em runtime, melhor performance e privacidade.

## Alternatives Considered
- **Style "Data-Dense Dashboard"** (recomendado primeiro pela skill): rejeitado por contradizer pedido explícito de "arejado".
- **Tailwind + shadcn/ui**: descartado — projeto já é MUI, a troca seria invasiva e o ROI baixo.
- **Material Dashboard / preset commercial**: descartado — perde personalidade editorial; aumenta dependências.
- **Manter Roboto + paleta atual**: descartado por pedido do usuário.

## Outcomes
- Páginas migradas em 2026-04-13. Pendências: as `enchanced-table-*` específicas (votes, awards-categories, etc.) ainda usam estilos próprios — herdam os defaults novos, mas não foram re-escritas. Migrar para `GenericTable` é follow-up.
- A próxima vez que adicionar uma página, **sempre** começar por `PageLayout` + `PageHeader` + `SectionCard`. Não montar `Paper`/`Box` manualmente para reproduzir shell.

## Related
- [Project Intent](../intent/project-intent.md)
- [Decision: Stack tecnológica](001-tech-stack.md)
- [Decision: Roteamento com lazy-loading](002-routing-react-router-lazy.md)
- [Pattern: Layout primitives](../knowledge/patterns/layout-primitives.md) (a criar)
- [Pattern: Tabela genérica](../knowledge/patterns/generic-table.md)

## Status
- **Created**: 2026-04-13 (Phase: Build)
- **Status**: Accepted
- **Note**: Fonte de inspiração: skill `ui-ux-pro-max` (via `uipro-cli`).
