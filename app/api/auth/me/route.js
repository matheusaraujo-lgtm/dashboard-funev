import getPool from "@/lib/db";
import { autenticarRequisicao } from "@/lib/auth";
import { withApiRateLimit, jsonErro, jsonOk } from "@/lib/api-helpers";

export async function GET(request) {
  return withApiRateLimit(request, async () => {
    const auth = await autenticarRequisicao(request);
    if (auth.erro) return jsonErro(auth.erro, auth.status);

    try {
      const pool = getPool();
      const { rows: permissoes } = await pool.query(
        "SELECT dashboard_id FROM usuarios_dashboards WHERE usuario_id = $1",
        [auth.usuario.id]
      );

      return jsonOk({
        id: auth.usuario.id,
        nome: auth.usuario.nome,
        email: auth.usuario.email,
        perfil: auth.usuario.perfil,
        dashboardsPermitidos: permissoes.map((p) => p.dashboard_id),
      });
    } catch {
      return jsonErro("Erro interno.", 500);
    }
  });
}
