import getPool from "@/lib/db";
import { autenticarRequisicao } from "@/lib/auth";
import { aplicarTituloHtml, verificarPermissaoDashboard } from "@/lib/dashboards";
import { lerHtml, htmlExiste } from "@/lib/blob";
import { withApiRateLimit, jsonErro, jsonOk } from "@/lib/api-helpers";

export async function GET(request, { params }) {
  return withApiRateLimit(request, async () => {
    const auth = await autenticarRequisicao(request);
    if (auth.erro) return jsonErro(auth.erro, auth.status);

    const { id } = await params;

    try {
      const pool = getPool();
      const { rows: usuarioRows } = await pool.query(
        "SELECT * FROM usuarios WHERE id = $1",
        [auth.usuario.id]
      );
      const usuario = usuarioRows[0];

      if (!usuario) {
        return jsonErro("Usuário não encontrado.", 401);
      }

      const { rows: dashboardRows } = await pool.query(
        "SELECT * FROM dashboards WHERE id = $1",
        [id]
      );
      const dashboard = dashboardRows[0];

      if (!dashboard) {
        return jsonErro("Dashboard não encontrado.", 404);
      }

      const temPermissao = await verificarPermissaoDashboard(
        usuario.id,
        usuario.perfil,
        id
      );
      if (!temPermissao) {
        return jsonErro("Sem permissão para este dashboard.", 403);
      }

      const existe = await htmlExiste(dashboard.arquivo);
      if (!existe) {
        return jsonErro("Arquivo HTML não encontrado.", 404);
      }

      const html = await lerHtml(dashboard.arquivo);
      const tituloHtml = dashboard.descricao || dashboard.nome;

      return jsonOk({
        id: dashboard.id,
        nome: dashboard.nome,
        descricao: dashboard.descricao,
        html: aplicarTituloHtml(html, tituloHtml),
      });
    } catch {
      return jsonErro("Erro interno.", 500);
    }
  });
}
