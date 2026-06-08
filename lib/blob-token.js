/**
 * Token estático para uploads do browser (handleUpload).
 * OIDC (BLOB_STORE_ID) não substitui este token em client uploads.
 * @see https://vercel.com/docs/vercel-blob/using-blob-sdk#authentication
 */
export function obterTokenBlobLeituraEscrita() {
  return process.env.BLOB_READ_WRITE_TOKEN || null;
}

export function blobConfigurado() {
  return Boolean(obterTokenBlobLeituraEscrita());
}

export function mensagemBlobNaoConfigurado() {
  return (
    "BLOB_READ_WRITE_TOKEN ausente. Vercel → Storage → seu Blob → Settings → " +
    "inclua o Read-Write Token no projeto (Production + Preview) e redeploy."
  );
}
