# Variáveis de ambiente

## Produção (Vercel Hobby)

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | Connection string PostgreSQL (Neon) |
| `JWT_SECRET` | Sim | Segredo para assinar JWT (mín. 32 caracteres) |
| `BLOB_READ_WRITE_TOKEN` | Sim | Token Vercel Blob (auto ao conectar Storage) |
| `NEXT_PUBLIC_BLOB_UPLOAD` | Sim | `true` — upload direto ao Blob (obrigatório no Hobby) |
| `NEXT_PUBLIC_APP_URL` | Sim | URL pública do app |
| `UPSTASH_REDIS_REST_URL` | Recomendado | URL REST do Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Recomendado | Token REST do Upstash |
| `NEXT_PUBLIC_VERCEL` | Auto | `1` — definida pela Vercel |

## Desenvolvimento local

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | — | Ou use vars `DB_*` abaixo |
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5432` | Porta |
| `DB_NAME` | `sigma` | Nome do banco |
| `DB_USER` | `sigma` | Usuário |
| `DB_PASSWORD` | `sigma123` | Senha |
| `DB_SSL` | `false` | `true` para Neon/produção |
| `JWT_SECRET` | — | Obrigatório |
| `NEXT_PUBLIC_BLOB_UPLOAD` | `false` | `false` = HTML no disco local |
| `BLOB_READ_WRITE_TOKEN` | — | Opcional em dev (usa disco) |

## Exemplo `.env.local` (desenvolvimento)

```env
DATABASE_URL=postgresql://sigma:sigma123@localhost:5432/sigma
JWT_SECRET=desenvolvimento_trocar_em_producao_com_string_longa
NEXT_PUBLIC_BLOB_UPLOAD=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Exemplo Vercel (produção gratuita)

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=<gerar com openssl rand -hex 64>
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx
NEXT_PUBLIC_BLOB_UPLOAD=true
NEXT_PUBLIC_APP_URL=https://analytics-funev.vercel.app
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

## Gerar JWT_SECRET

```bash
# Linux/macOS
openssl rand -hex 64

# PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Variáveis removidas (legado Express)

Estas **não são mais usadas**:

- `PORT` — Vercel define automaticamente
- `CORS_ORIGIN` — mesma origem (Next.js unificado)
- `VITE_API_URL` — substituído por `/api` relativo
