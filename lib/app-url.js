/** URL pública do app (domínio customizado ou Vercel). */
export function obterUrlApp() {
  const explicita = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicita) return explicita;

  const producao = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (producao) return `https://${producao}`.replace(/\/$/, "");

  return null;
}
