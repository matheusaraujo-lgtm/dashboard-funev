import getPool from "@/lib/db";
import { autenticarRequisicao, exigirAdmin } from "@/lib/auth";
import { withApiRateLimit, jsonErro, jsonOk } from "@/lib/api-helpers";

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

    const { dashboardsPermitidos } = corpo;

    if (!Array.isArray(dashboardsPermitidos)) {
      return jsonErro("dashboardsPermitidos deve ser um array.");
    }

    try {
      const pool = getPool();
      const { rows } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
      const usuario = rows[0];

      if (!usuario) {
        return jsonErro("Usuário não encontrado.", 404);
      }

      if (usuario.perfil === "admin") {
        return jsonErro("Admin já possui acesso total.");
      }

      const { rows: existentes } = await pool.query(
        "SELECT id FROM dashboards WHERE id = ANY($1::text[])",
        [dashboardsPermitidos]
      );
      const idsValidos = existentes.map((d) => d.id);

      await pool.query("DELETE FROM usuarios_dashboards WHERE usuario_id = $1", [id]);

      if (idsValidos.length > 0) {
        await pool.query(
          "INSERT INTO usuarios_dashboards (usuario_id, dashboard_id) SELECT $1, unnest($2::text[])",
          [id, idsValidos]
        );
      }

      return jsonOk({
        mensagem: "Permissões atualizadas com sucesso.",
        usuario: { id: usuario.id, nome: usuario.nome, dashboardsPermitidos: idsValidos },
      });
    } catch {
      return jsonErro("Erro interno.", 500);
    }
  });
}
