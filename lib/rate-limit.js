import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const limitadores = {};

function obterLimitador(tipo, windowMs, max) {
  if (limitadores[tipo]) return limitadores[tipo];

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    const redis = new Redis({ url, token });
    limitadores[tipo] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
      analytics: false,
      prefix: `analytics-funev:${tipo}`,
    });
    return limitadores[tipo];
  }

  // Fallback em memória para desenvolvimento local
  const contadores = new Map();
  limitadores[tipo] = {
    async limit(identificador) {
      const agora = Date.now();
      const chave = `${tipo}:${identificador}`;
      const entrada = contadores.get(chave) || { count: 0, resetAt: agora + windowMs };

      if (agora > entrada.resetAt) {
        entrada.count = 0;
        entrada.resetAt = agora + windowMs;
      }

      entrada.count += 1;
      contadores.set(chave, entrada);

      return {
        success: entrada.count <= max,
        limit: max,
        remaining: Math.max(0, max - entrada.count),
        reset: entrada.resetAt,
      };
    },
  };
  return limitadores[tipo];
}

function obterIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function limitarLogin(request) {
  const limitador = obterLimitador("login", 15 * 60 * 1000, 10);
  const resultado = await limitador.limit(obterIp(request));

  if (!resultado.success) {
    return Response.json(
      { erro: "Muitas tentativas de login. Aguarde 15 minutos." },
      { status: 429 }
    );
  }
  return null;
}

export async function limitarApi(request) {
  const limitador = obterLimitador("api", 60 * 1000, 200);
  const resultado = await limitador.limit(obterIp(request));

  if (!resultado.success) {
    return Response.json(
      { erro: "Limite de requisições atingido. Tente novamente em instantes." },
      { status: 429 }
    );
  }
  return null;
}
