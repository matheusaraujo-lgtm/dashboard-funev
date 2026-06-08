import fs from "fs";
import path from "path";
import { put, del, head } from "@vercel/blob";

const CAMINHO_LOCAL = path.join(process.cwd(), "dados", "dashboards");

function usarBlobRemoto() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function garantirPastaLocal() {
  if (!fs.existsSync(CAMINHO_LOCAL)) {
    fs.mkdirSync(CAMINHO_LOCAL, { recursive: true });
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

  garantirPastaLocal();
  return fs.existsSync(path.join(CAMINHO_LOCAL, identificador));
}

export function gerarNomeArquivo(nomeOriginal) {
  const crypto = require("crypto");
  const id = crypto.randomUUID();
  const nomeSeguro = (nomeOriginal || "dashboard.html").replace(/[^a-zA-Z0-9._-]/g, "_");
  return `dashboards/${id}-${nomeSeguro}`;
}
