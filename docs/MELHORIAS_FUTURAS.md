# Melhorias futuras

Roadmap técnico para evoluções do Analytics FUNEV. Itens **não implementados** — apenas documentados.

## Prioridade alta

### TypeScript
Migrar de JavaScript para TypeScript com tipagem de API, modelos de banco e componentes.

### Migrations versionadas
Substituir `CREATE TABLE IF NOT EXISTS` por Drizzle Kit ou Prisma Migrate com histórico de alterações.

### Refresh token
Sessões mais longas com refresh token httpOnly e rotação de tokens, reduzindo re-logins a cada 8h.

## Prioridade média

### Testes E2E
Playwright para fluxos críticos: login, permissões, publicação e visualização de dashboard.

### Logs estruturados
Integração com Axiom ou Datadog para rastrear erros e auditoria de ações admin.

### Auditoria admin
Tabela `audit_log` registrando quem publicou, editou ou removeu dashboards e usuários.

### CSP no visualizador
Content-Security-Policy mais restritivo no iframe, balanceando segurança vs. dashboards com recursos externos.

## Prioridade baixa

### CI/CD com preview
GitHub Actions + preview deployments automáticos por PR.

### Notificações
Email ou webhook quando novo dashboard é publicado.

### Busca full-text
PostgreSQL `tsvector` ou Meilisearch para busca avançada em metadados.

### PWA offline
Service worker para cache de shell da aplicação (não dos dashboards HTML).

## Segurança — HTML não confiável

Os dashboards são arquivos HTML enviados por administradores e renderizados via `srcDoc` em iframe com sandbox. Riscos conhecidos:

- Scripts maliciosos no HTML (mitigado parcialmente pelo sandbox)
- Recursos externos (CDNs, fonts) — CSP desabilitado intencionalmente
- Phishing dentro do iframe

**Recomendação:** publicar apenas HTML de fontes confiáveis; considerar sanitização server-side no futuro.

## Plano Vercel

Se o uso ultrapassar o tier gratuito:

| Recurso | Upgrade |
|---------|---------|
| Mais invocações/bandwidth | Vercel Pro ($20/mês) |
| Mais storage DB | Neon Launch |
| Mais Blob | Vercel Blob paid tier |
| SLA/comercial | Vercel Pro + domínio + monitoramento |

Para uso interno FUNEV, o Hobby costuma ser suficiente por longo período.
