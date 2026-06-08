# Analytics FUNEV

Portal interno de dashboards HTML com autenticação JWT, controle de permissões (admin/usuário) e publicação de relatórios standalone.

Stack: **Next.js 15** (App Router + Route Handlers), **PostgreSQL** (Neon), **Vercel Blob**, **Upstash Redis**.

> Configurado para o **plano gratuito (Hobby) da Vercel**. Veja [docs/VERCEL_FREE.md](docs/VERCEL_FREE.md).

## Requisitos

- Node.js 18+
- PostgreSQL (recomendado: [Neon](https://neon.tech) — tier gratuito)
- Conta [Vercel](https://vercel.com) (plano Hobby/gratuito)

## Desenvolvimento local

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env.local

# 2. Instalar dependências
npm install

# 3. Criar tabelas no banco
npm run db:init

# 4. Iniciar servidor
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Variáveis mínimas para dev local

> **Atenção:** estes valores são só para rodar na sua máquina. **Não use na Vercel** — em produção copie a `DATABASE_URL` do Neon (arquivo `.env.local` ou painel Neon).

```env
DATABASE_URL=postgresql://sigma:sigma123@localhost:5432/sigma
JWT_SECRET=dev_secret_trocar_em_producao
NEXT_PUBLIC_BLOB_UPLOAD=false
```

Com `NEXT_PUBLIC_BLOB_UPLOAD=false`, os HTMLs ficam em `dados/dashboards/` no disco local.

## Deploy na Vercel (gratuito)

Passo a passo completo em [docs/VERCEL_FREE.md](docs/VERCEL_FREE.md).

Resumo:

1. Criar projeto na Vercel e conectar o repositório
2. Adicionar **Neon** (Postgres gratuito) via Marketplace da Vercel
3. Adicionar **Vercel Blob** no projeto
4. Adicionar **Upstash Redis** (tier gratuito) para rate limit
5. Definir `JWT_SECRET` nas variáveis de ambiente
6. Definir `NEXT_PUBLIC_BLOB_UPLOAD=true`
7. Rodar `npm run db:init` apontando para o banco Neon
8. Deploy automático a cada push

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run db:init` | Cria tabelas no PostgreSQL |
| `npm run db:migrar` | Importa `scripts/dados/banco.json` legado |
| `npm run blob:migrar` | Envia HTMLs locais para Vercel Blob |

## Estrutura

```
app/           # Páginas e Route Handlers (/api)
components/    # UI React
lib/           # Banco, auth, blob, rate limit
middleware.js  # Proteção de rotas
scripts/       # Migração e schema SQL
docs/          # Documentação técnica
```

## Documentação

- [Arquitetura](docs/ARQUITETURA.md)
- [Variáveis de ambiente](docs/VARIAVEIS_AMBIENTE.md)
- [Referência da API](docs/API.md)
- [Deploy Vercel gratuito](docs/VERCEL_FREE.md)
- [Melhorias futuras](docs/MELHORIAS_FUTURAS.md)

## Licença

Uso interno FUNEV.
