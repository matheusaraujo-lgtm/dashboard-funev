import fs from "fs";
import path from "path";
import { put, del, head } from "@vercel/blob";
import { estaNaVercel } from "@/lib/vercel-env";

const CAMINHO_LOCAL = path.join(process.cwd(), "dados", "dashboards");

function usarBlobRemoto() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function arquivoLocal(identificador) {
  return (
    identificador &&
    !identificador.startsWith("http://") &&
    !identificador.startsWith("https://")
  );
}

function garantirPastaLocal() {
  try {
    if (!fs.existsSync(CAMINHO_LOCAL)) {
      fs.mkdirSync(CAMINHO_LOCAL, { recursive: true });
    }
  } catch {
    // Filesystem somente leitura (ex.: Vercel serverless)
  }
}

function extrairPathnameBlob(identificador) {
  if (!identificador) return null;
  if (identificador.startsWith("http://") || identificador.startsWith("https://")) {
    try {
      return new URL(identificador).pathname.replace(/^\//, "");
    } catch {
      return null;
    }
  }
  return identificador;
}

/**
 * Salva HTML no Vercel Blob (produção) ou disco local (desenvolvimento).
 * Retorna identificador armazenado em dashboards.arquivo.
 */
export async function salvarHtml(nomeArquivo, conteudo, identificadorExistente = null) {
  if (usarBlobRemoto()) {
    const pathname =
      extrairPathnameBlob(identificadorExistente) || nomeArquivo;
    const blob = await put(pathname, conteudo, {
      access: "public",
      contentType: "text/html",
      addRandomSuffix: false,
      allowOverwrite: Boolean(identificadorExistente),
    });
    return blob.url;
  }

  garantirPastaLocal();
  const nomeLocal = identificadorExistente && !identificadorExistente.startsWith("http")
    ? identificadorExistente
    : nomeArquivo;
  const caminho = path.join(CAMINHO_LOCAL, path.basename(nomeLocal));
  fs.writeFileSync(caminho, conteudo, "utf-8");
  return path.basename(nomeLocal);
}

/**
 * Lê HTML pelo identificador (URL do blob ou nome de arquivo local).
 */
export async function lerHtml(identificador) {
  if (!identificador) return null;

  if (identificador.startsWith("http://") || identificador.startsWith("https://")) {
    const resposta = await fetch(identificador);
    if (!resposta.ok) return null;
    return resposta.text();
  }

  if (estaNaVercel()) {
    return null;
  }

  garantirPastaLocal();
  const caminho = path.join(CAMINHO_LOCAL, identificador);
  if (!fs.existsSync(caminho)) return null;
  return fs.readFileSync(caminho, "utf-8");
}

/**
 * Remove HTML do storage.
 */
export async function removerHtml(identificador) {
  if (!identificador) return;

  if (identificador.startsWith("http://") || identificador.startsWith("https://")) {
    try {
      await del(identificador);
    } catch {
      // Blob pode já ter sido removido
    }
    return;
  }

  if (arquivoLocal(identificador) && estaNaVercel()) {
    return;
  }

  garantirPastaLocal();
  const caminho = path.join(CAMINHO_LOCAL, identificador);
  if (fs.existsSync(caminho)) {
    fs.unlinkSync(caminho);
  }
}

/**
 * Verifica se o HTML existe no storage.
 */
export async function htmlExiste(identificador) {
  if (!identificador) return false;

  if (identificador.startsWith("http://") || identificador.startsWith("https://")) {
    try {
      await head(identificador);
      return true;
    } catch {
      return false;
    }
  }

  if (estaNaVercel()) {
    return false;
  }

  garantirPastaLocal();
  return fs.existsSync(path.join(CAMINHO_LOCAL, identificador));
}

export function gerarNomeArquivo(nomeOriginal) {
  const crypto = require("crypto");
  const id = crypto.randomUUID();
  const nomeSeguro = (nomeOriginal || "dashboard.html").replace(/[^a-zA-Z0-9._-]/g, "_");
  return `dashboards/${id}-${nomeSeguro}`;
}
