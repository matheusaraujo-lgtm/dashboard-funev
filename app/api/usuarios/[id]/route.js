import bcrypt from "bcryptjs";
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

    const { nome, email, perfil, senha } = corpo;

    if (!nome || !email || !perfil) {
      return jsonErro("Nome, email e perfil são obrigatórios.");
    }
    if (!["admin", "usuario"].includes(perfil)) {
      return jsonErro("Perfil deve ser admin ou usuario.");
    }

    try {
      const pool = getPool();
      const { rows } = await pool.query("SELECT id FROM usuarios WHERE id = $1", [id]);
      if (!rows[0]) return jsonErro("Usuário não encontrado.", 404);

      if (senha) {
        const senhaHash = bcrypt.hashSync(senha, 12);
        await pool.query(
          "UPDATE usuarios SET nome=$1, email=$2, perfil=$3, senha_hash=$4 WHERE id=$5",
          [nome, email, perfil, senhaHash, id]
        );
      } else {
        await pool.query(
          "UPDATE usuarios SET nome=$1, email=$2, perfil=$3 WHERE id=$4",
          [nome, email, perfil, id]
        );
      }

      return jsonOk({ id, nome, email, perfil });
    } catch (err) {
      if (err.code === "23505") {
        return jsonErro("Já existe usuário com este email.", 409);
      }
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

    if (id === auth.usuario.id) {
      return jsonErro("Você não pode excluir seu próprio usuário.");
    }

    try {
      const pool = getPool();
      const { rows } = await pool.query("SELECT id FROM usuarios WHERE id = $1", [id]);
      if (!rows[0]) return jsonErro("Usuário não encontrado.", 404);

      await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
      return jsonOk({ mensagem: "Usuário removido com sucesso." });
    } catch {
      return jsonErro("Erro interno.", 500);
    }
  });
}
