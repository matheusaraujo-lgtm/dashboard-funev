import { NextResponse } from "next/server";
import { NOME_COOKIE_TOKEN } from "@/lib/constants";

const ROTAS_PUBLICAS = ["/login", "/api/saude", "/api/auth/login"];
const ROTAS_ADMIN = ["/publicar", "/usuarios", "/permissoes"];

function decodificarPayloadJwt(token) {
  try {
    const parte = token.split(".")[1];
    const json = atob(parte.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(NOME_COOKIE_TOKEN)?.value;

  if (!token) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodificarPayloadJwt(token);
  if (!payload) {
    const resposta = NextResponse.redirect(new URL("/login", request.url));
    resposta.cookies.delete(NOME_COOKIE_TOKEN);
    return resposta;
  }

  if (pathname === "/" || pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboards", request.url));
  }

  const exigeAdmin = ROTAS_ADMIN.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );
  if (exigeAdmin && payload.perfil !== "admin") {
    return NextResponse.redirect(new URL("/dashboards", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
