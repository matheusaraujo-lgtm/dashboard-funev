import { LIMITE_HTML_API } from "@/lib/constants";
import { usaUploadBlobClient } from "@/lib/vercel-env";

/**
 * Upload browser→Blob só acima de 4 MB (limite do body serverless na Vercel).
 * Arquivos menores vão via FormData para a API (sem CORS com blob.vercel-storage.com).
 */
export function deveUsarUploadBlobCliente(tamanhoBytes) {
  return usaUploadBlobClient() && tamanhoBytes > LIMITE_HTML_API;
}
