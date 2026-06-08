import getPool from "@/lib/db";
import { autenticarRequisicao } from "@/lib/auth";
import { mapearDashboard } from "@/lib/dashboards";
import { withApiRateLimit, jsonErro, jsonOk } from "@/lib/api-helpers";

export async function GET(request) {
  return withApiRateLimit(request, async () => {
    const auth = await autenticarRequisicao(request);
    if (auth.erro) return jsonErro(auth.erro, auth.status);

    try {
      const pool = getPool();
      const { rows: usuarioRows } = await pool.query(
        "SELECT perfil FROM usuarios WHERE id = $1",
        [auth.usuario.id]
      );

      if (!usuarioRows[0]) {
        return jsonErro("Usuário não encontrado.", 401);
      }

      let result;
      if (usuarioRows[0].perfil === "admin") {
        result = await pool.query("SELECT * FROM dashboards ORDER BY criado_em");
      } else {
        result = await pool.query(
          `SELECT d.* FROM dashboards d
           JOIN usuarios_dashboards ud ON d.id = ud.dashboard_id
           WHERE ud.usuario_id = $1
           ORDER BY d.criado_em`,
          [auth.usuario.id]
        );
      }

      return jsonOk(result.rows.map(mapearDashboard));
    } catch {
      return jsonErro("Erro interno.", 500);
    }
  });
}
