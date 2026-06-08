import { NextResponse } from "next/server";
import { NOME_COOKIE_TOKEN } from "@/lib/auth";
import { withApiRateLimit, jsonOk } from "@/lib/api-helpers";

export async function POST(request) {
  return withApiRateLimit(request, async () => {
    const resposta = jsonOk({ mensagem: "Logout realizado com sucesso." });
    resposta.cookies.delete(NOME_COOKIE_TOKEN);
    return resposta;
  });
}
