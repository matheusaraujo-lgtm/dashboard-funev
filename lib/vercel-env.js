/** Detecta se o upload deve ir direto ao Vercel Blob (obrigatório no plano gratuito). */
export function usaUploadBlobClient() {
  return process.env.NEXT_PUBLIC_BLOB_UPLOAD !== "false";
}

/** Indica ambiente Vercel (variável automática em deploy). */
export function estaNaVercel() {
  return process.env.NEXT_PUBLIC_VERCEL === "1";
}
