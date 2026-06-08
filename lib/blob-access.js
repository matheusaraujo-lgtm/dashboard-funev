/**
 * Nível de acesso do Vercel Blob (deve bater com o store: Public ou Private).
 * Padrão: private — stores novos na Vercel costumam ser Private.
 */
export function obterAcessoBlob() {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BLOB_ACCESS === "public" ? "public" : "private";
  }
  return process.env.BLOB_DEFAULT_ACCESS === "public" ? "public" : "private";
}
