import { withApiRateLimit, jsonOk } from "@/lib/api-helpers";
import getPool from "@/lib/db";

export async function GET(request) {
  return withApiRateLimit(request, async () => {
    const url = process.env.DATABASE_URL || "";
    const diagnostico = {
      status: "ok",
      mensagem: "API Analytics FUNEV online",
      env: {
        database_url: Boolean(url),
        neon: url.includes("neon.tech"),
        localhost: url.includes("localhost") || url.includes("127.0.0.1"),
        jwt_secret: Boolean(process.env.JWT_SECRET),
      },
      banco: "nao_configurado",
    };

    if (url) {
      try {
        const pool = getPool();
        await pool.query("SELECT 1");
        diagnostico.banco = "conectado";
      } catch {
        diagnostico.banco = "erro_conexao";
      }
    }

    return jsonOk(diagnostico);
  });
}
