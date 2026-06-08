/** Constantes compartilhadas (compatível com Edge Runtime). */

export const NOME_COOKIE_TOKEN = "tokenAnalyticsFunev";

/** Limite de body em serverless no plano Hobby da Vercel (4,5 MB). */
export const LIMITE_BODY_VERCEL_HOBBY = 4.5 * 1024 * 1024;

/** Limite máximo de HTML via upload direto ao Blob. */
export const LIMITE_HTML_MAX = 20 * 1024 * 1024;

/** Margem segura para envio via API no plano gratuito (4 MB). */
export const LIMITE_HTML_API = 4 * 1024 * 1024;
