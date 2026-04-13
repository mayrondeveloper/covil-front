# Decision (PLAN): Autenticação e View Pública

## Context
Hoje qualquer pessoa com a URL apaga/edita tudo. Para deploy em produção real é preciso (1) restringir o admin a usuários autenticados e (2) ainda permitir que o resultado seja divulgado publicamente sem login.

Este documento é um **plano** — não foi implementado ainda. Serve para alinhar arquitetura e contrato com o backend antes de codificar.

## Status
- **Created**: 2026-04-13 (Phase: Intent)
- **Status**: Draft — aguardando validação para implementação.

---

## Parte 1 — Autenticação

### Decisão proposta
**JWT com refresh token em cookie HttpOnly**, login via email + senha. Sem multi-tenancy, sem federation (Google/GitHub) por enquanto — pode entrar depois sem refazer o core.

**Por que JWT + cookie HttpOnly e não localStorage:**
- Cookie HttpOnly não é acessível por JS → imune a XSS roubando token.
- Refresh token rotativo (cada refresh invalida o anterior) → mitiga roubo.
- Backend já tem sessão de negócio simples; não precisa de Redis/sessão server-side só pra auth.

### Contrato de backend a pedir
```
POST /auth/login
Body: { email, password }
Response 200: { user: { id, name, email, role }, access_token: "..." }
Set-Cookie: refresh_token=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/auth

POST /auth/refresh
Cookie: refresh_token=...
Response 200: { access_token: "..." }
Set-Cookie: refresh_token=<novo>; HttpOnly; ...

POST /auth/logout
Response 204; limpa o cookie

GET /auth/me
Header: Authorization: Bearer <access_token>
Response 200: { id, name, email, role }
```

### Roles
- `admin` — pode tudo (CRUD jogos, prêmios, votantes, votos).
- `voter` — só registra votos (futuro, se virar self-service).
- `viewer` — só lê (não usar inicialmente).

Backend protege rotas via guard de role. Frontend só **mostra** ou esconde botões com base em role; segurança real é no backend.

### Frontend — implementação prevista
- Novo módulo `src/auth/`:
  - `AuthContext` provê `{ user, login, logout, isAuthenticated }`.
  - `useAuth()` hook.
  - `<RequireAuth>` wrapper de rota: redireciona pra `/login` se não autenticado.
  - `<RequireRole role="admin">` para esconder ações.
- `axiosInstance`:
  - Interceptor de request adiciona `Authorization: Bearer <accessToken>` lendo de memória (não localStorage).
  - Interceptor de response: se 401, tenta `POST /auth/refresh` com cookie automático, refaz request original. Se refresh falha, força logout e redireciona.
- Nova página `/login` com form de email + senha.
- Boot da app chama `GET /auth/me` (silencioso) — se 401, mostra login; se ok, mantém usuário em memória.

### Riscos / pontos de atenção
- **CSRF** — cookie HttpOnly precisa de proteção CSRF. Soluções: SameSite=Lax (já defende contra a maioria) + double-submit token em endpoints de mutation. Discutir com backend.
- **CORS** — cookies cross-origin precisam de `withCredentials: true` no axios + `Access-Control-Allow-Credentials: true` no backend.
- **Acesso público à página de anúncio** — `/awards/:id/announcement` deve ficar fora do `<RequireAuth>` (ver Parte 2).

### Esforço estimado
- Backend: 1–2 dias (rotas, hash bcrypt, refresh rotation, role guard).
- Frontend: 1 dia (context, hooks, login page, interceptor refresh).

---

## Parte 2 — View pública dos vencedores

### Decisão proposta
Página `/public/awards/:id` (ou `/anuncio/:slug`) **sem auth**, com layout idêntico ao `/awards/:id/announcement` mas:
- Sem toolbar de admin (Voltar/Copiar link OK; sem botão de edição).
- Acessível por link compartilhável.
- **Só visível depois que admin marca a edição como "publicada"** (campo `published_at` no Award).

### Contrato de backend a pedir
- Adicionar campo `published_at: Date | null` em `Award`.
- `POST /awards/:id/publish` — define `published_at = now()`. Idempotente.
- `POST /awards/:id/unpublish` — define `published_at = null`.
- `GET /public/awards/:id` — retorna o Award + ranking de todas as categorias num único payload (sem precisar do client orquestrar). **404 se não publicado.** Não exige auth.
- `GET /public/awards` — lista de edições publicadas (para SEO/index público se houver).

### Frontend — implementação prevista
- Novas rotas públicas em `src/router.js` (fora de `<RequireAuth>`):
  - `/public/awards/:id` — view read-only.
  - `/public/awards` — lista das publicadas.
- Componente reutilizado: `<Announcement>` ganha prop `mode: "admin" | "public"` que esconde toolbar de admin.
- Painel admin ganha botão "Publicar / Despublicar" no card de cada edição (estado visível: badge "publicado" verde).
- URL pública é compartilhada via "Copiar link" no botão de admin.

### SEO / OpenGraph (opcional, próxima iteração)
- `react-helmet-async` no `/public/awards/:id` define `<meta og:title>`, `og:description`, `og:image` (capa do prêmio).
- Permite preview rico em WhatsApp/Twitter ao compartilhar.

### Esforço estimado
- Backend: ~4h (campo, endpoints públicos, sem auth no controller).
- Frontend: ~3h (rotas públicas, mode no Announcement, botões publicar/despublicar).

---

## Sequenciamento sugerido
1. **Auth backend + frontend** — primeiro, pois protege todo o painel.
2. **View pública** — depois, pois depende da auth pra excluir aquelas rotas.

## Related
- [Project Intent](../intent/project-intent.md)
- [Decision: Camada HTTP com interceptor global](003-http-axios-interceptor.md) — vai precisar evoluir pra refresh automático.
- [Feature: Visualização de resultados](../intent/feature-awards-view.md) — view pública é uma extensão dela.
