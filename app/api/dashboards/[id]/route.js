import getPool from "@/lib/db";
import { autenticarRequisicao, exigirAdmin } from "@/lib/auth";
import { executarRemocaoDashboard } from "@/lib/dashboards";
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

    const { nome, descricao } = corpo;
    if (!nome) return jsonErro("Nome é obrigatório.");

    try {
      const pool = getPool();
      const { rows } = await pool.query("SELECT id FROM dashboards WHERE id = $1", [id]);
      if (!rows[0]) return jsonErro("Dashboard não encontrado.", 404);

      await pool.query("UPDATE dashboards SET nome=$1, descricao=$2 WHERE id=$3", [
        nome,
        descricao || "",
        id,
      ]);

      return jsonOk({ id, nome, descricao: descricao || "" });
    } catch {
      return jsonErro("Erro interno.", 500);
    }
  });
}

export async function DELETE(request, { params }) {
  return withApiRateLimit(request, async () => {
    const auth = await autenticarRequisicao(request);
    if (auth.erro) return jsonErro(auth.erro, auth.status);

    const admin = exigirAdmin(auth.usuario);
    if (admin) return jsonErro(admin.erro, admin.status);

    const { id } = await params;

    try {
      const resultado = await executarRemocaoDashboard(id);
      if (!resultado.ok) {
        return jsonErro(resultado.erro, resultado.status);
      }
      return jsonOk({ mensagem: "Dashboard removido com sucesso.", id: resultado.id });
    } catch {
      return jsonErro("Erro interno.", 500);
    }
  });
}
