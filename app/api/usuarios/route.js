import crypto from "crypto";
import bcrypt from "bcryptjs";
import getPool from "@/lib/db";
import { autenticarRequisicao, exigirAdmin } from "@/lib/auth";
import { withApiRateLimit, jsonErro, jsonOk } from "@/lib/api-helpers";

export async function GET(request) {
  return withApiRateLimit(request, async () => {
    const auth = await autenticarRequisicao(request);
    if (auth.erro) return jsonErro(auth.erro, auth.status);

    const admin = exigirAdmin(auth.usuario);
    if (admin) return jsonErro(admin.erro, admin.status);

    try {
      const pool = getPool();
      const { rows: usuarios } = await pool.query(
        "SELECT id, nome, email, perfil FROM usuarios ORDER BY nome"
      );

      const { rows: permissoes } = await pool.query(
        "SELECT usuario_id, dashboard_id FROM usuarios_dashboards"
      );

      const mapaPermissoes = {};
      permissoes.forEach(({ usuario_id, dashboard_id }) => {
        if (!mapaPermissoes[usuario_id]) mapaPermissoes[usuario_id] = [];
        mapaPermissoes[usuario_id].push(dashboard_id);
      });

      return jsonOk(
        usuarios.map((u) => ({
          ...u,
          dashboardsPermitidos: mapaPermissoes[u.id] || [],
        }))
      );
    } catch {
      return jsonErro("Erro interno.", 500);
    }
  });
}

export async function POST(request) {
  return withApiRateLimit(request, async () => {
    const auth = await autenticarRequisicao(request);
    if (auth.erro) return jsonErro(auth.erro, auth.status);

    const admin = exigirAdmin(auth.usuario);
    if (admin) return jsonErro(admin.erro, admin.status);

    let corpo;
    try {
      corpo = await request.json();
    } catch {
      return jsonErro("Corpo da requisição inválido.");
    }

    const { nome, email, senha, perfil } = corpo;

    if (!nome || !email || !senha || !perfil) {
      return jsonErro("Preencha nome, email, senha e perfil.");
    }

    if (typeof nome !== "string" || nome.length > 120) {
      return jsonErro("Nome inválido.");
    }
    if (typeof email !== "string" || email.length > 254) {
      return jsonErro("Email inválido.");
    }
    if (typeof senha !== "string" || senha.length < 6 || senha.length > 128) {
      return jsonErro("Senha deve ter entre 6 e 128 caracteres.");
    }
    if (!["admin", "usuario"].includes(perfil)) {
      return jsonErro("Perfil deve ser admin ou usuario.");
    }

    try {
      const pool = getPool();
      const id = crypto.randomUUID();
      const senhaHash = bcrypt.hashSync(senha, 12);

      await pool.query(
        "INSERT INTO usuarios (id, nome, email, senha_hash, perfil) VALUES ($1, $2, $3, $4, $5)",
        [id, nome, email, senhaHash, perfil]
      );

      return jsonOk({ id, nome, email, perfil }, 201);
    } catch (err) {
      if (err.code === "23505") {
        return jsonErro("Já existe usuário com este email.", 409);
      }
      return jsonErro("Erro interno.", 500);
    }
  });
}
