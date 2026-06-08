import getPool from "@/lib/db";
import { autenticarRequisicao, exigirAdmin } from "@/lib/auth";
import { aplicarTituloHtml } from "@/lib/dashboards";
import { lerHtml, salvarHtml, htmlExiste, gerarNomeArquivo } from "@/lib/blob";
import { LIMITE_HTML_API, LIMITE_HTML_MAX } from "@/lib/constants";
import { withApiRateLimit, jsonErro, jsonOk } from "@/lib/api-helpers";

export async function GET(request, { params }) {
  return withApiRateLimit(request, async () => {
    const auth = await autenticarRequisicao(request);
    if (auth.erro) return jsonErro(auth.erro, auth.status);

    const admin = exigirAdmin(auth.usuario);
    if (admin) return jsonErro(admin.erro, admin.status);

    const { id } = await params;

    try {
      const pool = getPool();
      const { rows } = await pool.query("SELECT * FROM dashboards WHERE id = $1", [id]);
      const dashboard = rows[0];
      if (!dashboard) return jsonErro("Dashboard não encontrado.", 404);

      const existe = await htmlExiste(dashboard.arquivo);
      if (!existe) return jsonErro("Arquivo HTML não encontrado.", 404);

      const html = await lerHtml(dashboard.arquivo);
      return jsonOk({ id: dashboard.id, nome: dashboard.nome, html });
    } catch {
      return jsonErro("Erro interno.", 500);
    }
  });
}

export async function PUT(request, { params }) {
  return withApiRateLimit(request, async () => {
    const auth = await autenticarRequisicao(request);
    if (auth.erro) return jsonErro(auth.erro, auth.status);

    const admin = exigirAdmin(auth.usuario);
    if (admin) return jsonErro(admin.erro, admin.status);

    const { id } = await params;
    let corpo;
    try {
      corpo = await request.json();
    } catch {
      return jsonErro("Corpo da requisição inválido.");
    }

    const { html, blobUrl } = corpo;

    try {
      const pool = getPool();
      const { rows } = await pool.query("SELECT * FROM dashboards WHERE id = $1", [id]);
      const dashboard = rows[0];
      if (!dashboard) return jsonErro("Dashboard não encontrado.", 404);

      const tituloHtml = dashboard.descricao || dashboard.nome;

      if (blobUrl) {
        const htmlBlob = await lerHtml(blobUrl);
        if (!htmlBlob) {
          return jsonErro("Não foi possível ler o arquivo enviado.");
        }
        const htmlFinal = aplicarTituloHtml(htmlBlob, tituloHtml);
        const arquivoFinal = await salvarHtml(
          gerarNomeArquivo(`${dashboard.nome}.html`),
          htmlFinal,
          blobUrl
        );

        await pool.query("UPDATE dashboards SET arquivo = $1 WHERE id = $2", [
          arquivoFinal,
          id,
        ]);

        return jsonOk({ mensagem: "HTML atualizado com sucesso." });
      }

      if (typeof html !== "string" || html.trim().length === 0) {
        return jsonErro("Conteúdo HTML inválido.");
      }
      if (html.length > LIMITE_HTML_MAX) {
        return jsonErro("Arquivo muito grande (máx 20 MB).");
      }
      if (html.length > LIMITE_HTML_API) {
        return jsonErro(
          "HTML acima de 4 MB não pode ser salvo via API no plano gratuito da Vercel. O editor usa upload direto ao Blob automaticamente.",
          413
        );
      }

      const htmlFinal = aplicarTituloHtml(html, tituloHtml);
      await salvarHtml(dashboard.arquivo, htmlFinal, dashboard.arquivo);

      return jsonOk({ mensagem: "HTML atualizado com sucesso." });
    } catch {
      return jsonErro("Erro interno.", 500);
    }
  });
}
