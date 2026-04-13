# Decision: Upload de imagem via proxy do backend

## Context
Antes, os campos de imagem (capa de jogo, foto de participante, banner de prêmio) eram URL string — o usuário tinha que hospedar a imagem em outro lugar e colar a URL. Atrito grande no uso diário.

## Decision
**Backend faz proxy do upload** (multipart) e devolve a URL final no Digital Ocean Spaces. Não usar presigned URLs.

**Contrato:**
- `POST /uploads` (`multipart/form-data`, campo `file`, query `?folder=games|participants|awards|misc`)
- Resposta `201`: `{ url, key, size, mime, width, height }`
- Erros: `400` (sem arquivo), `413` (>5MB), `415` (mime não suportado)
- `DELETE /uploads/:key` para remover o arquivo do bucket

**Backend:**
- Valida mime (`image/jpeg|png|webp|gif`), tamanho (≤5MB)
- Processa via `sharp`: rotate (corrige EXIF) + resize inside 1024×1024 + converte sempre para webp q80
- Gera `uuid` para key (não confia no nome do cliente)
- Sobe no Digital Ocean Spaces com ACL pública
- Stack: Nest + multer (memory) + sharp + `@aws-sdk/client-s3`

**Frontend:**
- Service `uploads-service.ts` com `upload(file, folder, onProgress)` e `remove(key)`.
- Componente `<ImageUpload>` controlado, encaixa em `react-hook-form` via `<Controller>`.
- Modo fallback "Colar URL" preservado para casos onde a imagem já está hospedada.

## Rationale
- **Validação centralizada** — backend controla mime, size e processamento; frontend não tem como garantir isso.
- **Otimização automática** — webp+resize reduz peso médio em ~70%; melhora performance e custo de banda do bucket.
- **Sem CORS no bucket** — proxy elimina a necessidade de configurar CORS no Spaces.
- **Sem chave secreta no client** — credenciais do bucket ficam só no backend.
- **Auditoria/segurança** — backend escolhe a key (uuid + path), o cliente não sobrescreve arquivos arbitrários.
- **Volume baixo** — admin tool com poucos uploads simultâneos, ~1–5MB cada. Proxy não é gargalo.

## Alternatives Considered
- **Presigned URL (cliente sobe direto no Spaces)**: rejeitado — exige CORS no bucket, validação no frontend (que pode ser burlada), e backend perde a chance de processar (resize/webp). Faria sentido só com upload de arquivos grandes/concorrentes (vídeos, datasets), não para imagens de admin.
- **Continuar com URL string manual**: rejeitado — fricção diária para o usuário.
- **Cloudinary/Imgix**: serviços externos teriam ótimas features (transformações, CDN), mas adicionam dependência externa, custo recorrente e onboarding. Spaces já está pago e em uso.

## Outcomes
- Atrito eliminado: usuário arrasta a imagem direto no formulário.
- Imagens otimizadas (webp + resize) reduzem peso e melhoram tempo de carga.
- 3 telas integradas: jogo (`folder=games`), participante (`folder=participants`), prêmio (`folder=awards`).

## Related
- [Project Intent](../intent/project-intent.md)
- [Decision: Camada HTTP com interceptor global](003-http-axios-interceptor.md)
- [Pattern: Primitives de formulário](../knowledge/patterns/form-primitives.md)

## Status
- **Created**: 2026-04-13 (Phase: Build)
- **Status**: Accepted
