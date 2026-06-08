import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NOME_COOKIE_TOKEN } from "@/lib/constants";

export { NOME_COOKIE_TOKEN } from "@/lib/constants";

const DURACAO_TOKEN = "8h";

function obterSegredoJwt() {
  const segredo = process.env.JWT_SECRET;
  if (!segredo) {
    throw new Error("JWT_SECRET não definido.");
  }
  return segredo;
}

export function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    },
    obterSegredoJwt(),
    { expiresIn: DURACAO_TOKEN }
  );
}

export function verificarToken(token) {
  try {
    return jwt.verify(token, obterSegredoJwt());
  } catch {
    return null;
  }
}

export function extrairTokenDaRequisicao(request) {
  const cabecalho = request.headers.get("authorization");
  if (cabecalho?.startsWith("Bearer ")) {
    return cabecalho.replace("Bearer ", "");
  }
  return request.cookies.get(NOME_COOKIE_TOKEN)?.value || null;
}

export async function autenticarRequisicao(request) {
  const token = extrairTokenDaRequisicao(request);
  if (!token) {
    return { erro: "Token ausente.", status: 401 };
  }

  const payload = verificarToken(token);
  if (!payload) {
    return { erro: "Token inválido ou expirado.", status: 401 };
  }

  return { usuario: payload };
}

export function exigirAdmin(usuario) {
  if (usuario.perfil !== "admin") {
    return { erro: "Acesso permitido somente para admin.", status: 403 };
  }
  return null;
}

export function opcoesCookieToken(token) {
  const producao = process.env.NODE_ENV === "production";
  return {
    name: NOME_COOKIE_TOKEN,
    value: token,
    httpOnly: true,
    secure: producao,
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  };
}

export async function definirCookieToken(token) {
  const store = await cookies();
  store.set(opcoesCookieToken(token));
}

export async function removerCookieToken() {
  const store = await cookies();
  store.delete(NOME_COOKIE_TOKEN);
}

export function respostaNaoAutorizado(mensagem, status = 401) {
  return Response.json({ erro: mensagem }, { status });
}
