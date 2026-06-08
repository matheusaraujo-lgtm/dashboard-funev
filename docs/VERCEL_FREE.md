# Deploy no plano gratuito da Vercel (Hobby)

Este guia cobre o deploy **sem custo** usando os tiers gratuitos da Vercel e serviços parceiros.

## Stack gratuita recomendada

| Serviço | Plano | Função |
|---------|-------|--------|
| **Vercel** | Hobby (grátis) | Hospedagem Next.js |
| **Neon** | Free | PostgreSQL |
| **Vercel Blob** | Incluso no Hobby | Armazenamento dos HTMLs |
| **Upstash Redis** | Free | Rate limit (login e API) |

## Limites importantes do plano Hobby

| Limite | Valor | Como o projeto contorna |
|--------|-------|-------------------------|
| Body máximo em serverless | **4,5 MB** | Upload direto do browser ao Blob |
| Timeout de função | 10 s | Queries SQL simples, sem processamento pesado |
| Disco efêmero | Sem persistência | Blob para HTMLs, Neon para dados |
| Invocações | 100 GB-h/mês | Suficiente para uso interno |

### Upload de dashboards (até 20 MB)

No plano gratuito, **não envie o HTML pela API**. O fluxo correto:

1. Browser faz upload direto ao **Vercel Blob** (`@vercel/blob/client`)
2. API recebe apenas `{ nome, descricao, blobUrl }` (payload pequeno)
3. API aplica título no HTML e grava metadados no Postgres

Isso já está implementado em **Publicar** quando `NEXT_PUBLIC_BLOB_UPLOAD=true`.

### Edição de HTML grande

- Até **4 MB**: salvo via API normalmente
- Acima de **4 MB**: editor usa upload direto ao Blob automaticamente

## Passo a passo do deploy

### 1. Criar projeto na Vercel

```bash
npm i -g vercel
vercel login
vercel
```

Ou conecte o repositório GitHub em [vercel.com/new](https://vercel.com/new).

### 2. PostgreSQL com Neon (grátis)

1. No dashboard Vercel → **Storage** → **Create Database** → **Neon**
2. Plano **Free** (0,5 GB storage, suficiente para usuários e metadados)
3. A Vercel injeta `DATABASE_URL` automaticamente

### 3. Vercel Blob

1. **Storage** → **Create** → **Blob**
2. A Vercel injeta `BLOB_READ_WRITE_TOKEN`

### 4. Upstash Redis (grátis)

1. **Storage** → **Create** → **Upstash Redis**
2. Plano **Free** (10.000 comandos/dia — suficiente para rate limit)
3. Injeta `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`

### 5. Variáveis de ambiente

No painel Vercel → **Settings** → **Environment Variables**:

| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `JWT_SECRET` | String aleatória longa (64+ chars) | Sim |
| `NEXT_PUBLIC_BLOB_UPLOAD` | `true` | Sim |
| `NEXT_PUBLIC_APP_URL` | `https://seu-dominio.vercel.app` | Sim |
| `DATABASE_URL` | (auto via Neon) | Sim |
| `BLOB_READ_WRITE_TOKEN` | (auto via Blob) | Sim |
| `UPSTASH_REDIS_REST_*` | (auto via Upstash) | Recomendado |

> `NEXT_PUBLIC_VERCEL=1` é definida automaticamente pela Vercel.

### 6. Inicializar banco

Na sua máquina (com `DATABASE_URL` do Neon no `.env.local`):

```bash
npm run db:init
```

Crie o primeiro admin manualmente ou importe dados legados:

```bash
npm run db:migrar    # se tiver scripts/dados/banco.json
npm run blob:migrar  # se tiver HTMLs locais para enviar ao Blob
```

### 7. Deploy

```bash
vercel --prod
```

Ou push na branch principal com integração Git.

## Domínio customizado (opcional)

No plano Hobby você pode usar domínio próprio (ex.: `analytics.funev.org.br`):

1. Vercel → **Settings** → **Domains**
2. Adicionar domínio e configurar DNS (CNAME)
3. Atualizar `NEXT_PUBLIC_APP_URL`

## Monitoramento de uso gratuito

- **Vercel**: Dashboard → Usage (invocações, bandwidth)
- **Neon**: Console Neon → Usage (storage, compute)
- **Blob**: Vercel Storage → usage
- **Upstash**: Console Upstash → daily commands

Para uso interno (dezenas de usuários), os tiers gratuitos costumam ser suficientes.

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Upload falha com 413 | Confirme `NEXT_PUBLIC_BLOB_UPLOAD=true` |
| Login bloqueado após tentativas | Upstash rate limit — aguarde 15 min |
| HTML não aparece | Verifique Blob conectado e `BLOB_READ_WRITE_TOKEN` |
| Erro de conexão DB | Use connection string **pooled** do Neon |
| Build falha | Rode `npm run build` localmente para ver o erro |

## Segurança

- **Rotacione** o `JWT_SECRET` e senhas do banco antigo (`ecosystem.config.js`) — não reutilize
- Nunca commite `.env.local`
- O plano Hobby é para projetos pessoais/internos; para SLA comercial, considere Pro
