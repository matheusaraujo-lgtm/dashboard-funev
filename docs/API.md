# Referência da API

Base: `/api` — respostas de erro: `{ "erro": "mensagem" }`

Autenticação: cookie `tokenAnalyticsFunev` (httpOnly) ou header `Authorization: Bearer <token>`.

## Saúde

### `GET /api/saude`

Público. Health check.

**Resposta 200:**
```json
{ "status": "ok", "mensagem": "API Analytics FUNEV online" }
```

---

## Autenticação

### `POST /api/auth/login`

Público. Rate limit: 10/15min por IP.

**Body:**
```json
{ "email": "admin@funev.org.br", "senha": "******" }
```

**Resposta 200:** Define cookie httpOnly + retorna:
```json
{
  "token": "eyJ...",
  "usuario": {
    "id": "uuid",
    "nome": "Admin",
    "email": "admin@funev.org.br",
    "perfil": "admin",
    "dashboardsPermitidos": []
  }
}
```

### `POST /api/auth/logout`

Autenticado. Remove cookie.

### `GET /api/auth/me`

Autenticado. Retorna usuário atual.

---

## Usuários (admin)

### `GET /api/usuarios`

Lista usuários com `dashboardsPermitidos`.

### `POST /api/usuarios`

**Body:**
```json
{ "nome": "João", "email": "joao@funev.org.br", "senha": "123456", "perfil": "usuario" }
```

### `PUT /api/usuarios/:id`

**Body:** `{ "nome", "email", "perfil", "senha?" }` — senha opcional na edição.

### `DELETE /api/usuarios/:id`

Não permite excluir o próprio usuário.

### `PUT /api/usuarios/:id/permissoes`

**Body:**
```json
{ "dashboardsPermitidos": ["uuid-dashboard-1", "uuid-dashboard-2"] }
```

---

## Dashboards

### `GET /api/dashboards`

Autenticado. Admin vê todos; usuário vê permitidos.

### `PUT /api/dashboards/:id`

Admin. **Body:** `{ "nome", "descricao?" }`

### `DELETE /api/dashboards/:id`

Admin. Remove dashboard e HTML no Blob.

### `POST /api/dashboards/remover`

Admin. **Body:** `{ "idDashboard": "uuid" }`

---

## Upload (Vercel gratuita)

### `POST /api/dashboards/upload-url`

Admin. Gera token para upload direto ao Blob (client-side).

Usado internamente por `@vercel/blob/client`.

### `POST /api/dashboards/upload`

Admin. Registra dashboard após upload.

**Opção A — Blob (produção):**
```json
{ "nome": "Custeio", "descricao": "Relatório mensal", "blobUrl": "https://xxx.blob.vercel-storage.com/..." }
```

**Opção B — FormData (dev local):**
```
nome, descricao, arquivoHtml (.html, máx 20 MB)
```

---

## Conteúdo HTML

### `GET /api/dashboards/:id/conteudo`

Autenticado + permissão. Retorna HTML para visualizador.

**Resposta:**
```json
{ "id", "nome", "descricao", "html": "<!DOCTYPE html>..." }
```

### `GET /api/dashboards/:id/html`

Admin. HTML bruto para edição.

### `PUT /api/dashboards/:id/html`

Admin. Atualiza HTML.

**Opção A — corpo pequeno (≤ 4 MB, dev/Hobby):**
```json
{ "html": "<!DOCTYPE html>..." }
```

**Opção B — Blob (HTML grande, Hobby):**
```json
{ "blobUrl": "https://xxx.blob.vercel-storage.com/..." }
```

**Erro 413:** HTML > 4 MB sem blobUrl no plano gratuito.

---

## Códigos HTTP

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Conflito (email duplicado) |
| 413 | Payload muito grande |
| 429 | Rate limit |
| 500 | Erro interno |
