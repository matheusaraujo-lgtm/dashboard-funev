import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import getPool from "@/lib/db";
import {
  gerarToken,
  opcoesCookieToken,
} from "@/lib/auth";
import { limitarLogin } from "@/lib/rate-limit";
import { jsonErro, jsonOk } from "@/lib/api-helpers";

export async function POST(request) {
  const bloqueio = await limitarLogin(request);
  if (bloqueio) return bloqueio;

  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return jsonErro("Corpo da requisição inválido.");
  }

  const { email, senha } = corpo;

  if (!email || !senha) {
    return jsonErro("Email e senha são obrigatórios.");
  }

  if (typeof email !== "string" || email.length > 254) {
    return jsonErro("Email inválido.");
  }

  try {
    const pool = getPool();
    const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email.toLowerCase().trim(),
    ]);
    const usuario = rows[0];

    if (!usuario) {
      return jsonErro("Email ou senha inválidos.", 401);
    }

    const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
    if (!senhaValida) {
      return jsonErro("Email ou senha inválidos.", 401);
    }

    const { rows: permissoes } = await pool.query(
      "SELECT dashboard_id FROM usuarios_dashboards WHERE usuario_id = $1",
      [usuario.id]
    );
    const dashboardsPermitidos = permissoes.map((p) => p.dashboard_id);

    const token = gerarToken(usuario);
    const resposta = jsonOk({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        dashboardsPermitidos,
      },
    });

    resposta.cookies.set(opcoesCookieToken(token));
    return resposta;
  } catch {
    return jsonErro("Erro interno.", 500);
  }
}
