import { NextResponse } from "next/server";
import { limitarApi } from "@/lib/rate-limit";

export async function withApiRateLimit(request, handler) {
  const bloqueio = await limitarApi(request);
  if (bloqueio) return bloqueio;
  return handler();
}

export function jsonErro(mensagem, status = 400) {
  return NextResponse.json({ erro: mensagem }, { status });
}

export function jsonOk(dados, status = 200) {
  return NextResponse.json(dados, { status });
}
