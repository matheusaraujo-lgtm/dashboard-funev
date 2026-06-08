import getPool from "@/lib/db";
import { autenticarRequisicao, exigirAdmin } from "@/lib/auth";
import { executarRemocaoDashboard } from "@/lib/dashboards";
import { withApiRateLimit, jsonErro, jsonOk } from "@/lib/api-helpers";

export async function POST(request) {
  return withApiRateLimit(request, async () => {
    const auth = await autenticarRequisicao(request);
    if (auth.erro) return jsonErro(auth.erro, auth.status);

    const admin = exigirAdmin(auth.usuario);
    if (admin) return jsonErro(admin.erro, admin.status);

    try {
      const corpo = await request.json();
      const idDashboard = corpo?.idDashboard ?? corpo?.id;
      const resultado = await executarRemocaoDashboard(idDashboard);

      if (!resultado.ok) {
        return jsonErro(resultado.erro, resultado.status);
      }

      return jsonOk({ mensagem: "Dashboard removido com sucesso.", id: resultado.id });
    } catch {
      return jsonErro("Erro interno.", 500);
    }
  });
}
