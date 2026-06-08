import fs from "fs";
import path from "path";
import { put, del, head, get } from "@vercel/blob";
import { estaNaVercel } from "@/lib/vercel-env";
import { obterAcessoBlob } from "@/lib/blob-access";
import { obterTokenBlobLeituraEscrita, blobServidorDisponivel } from "@/lib/blob-token";

const CAMINHO_LOCAL = path.join(process.cwd(), "dados", "dashboards");

function usarBlobRemoto() {
  return blobServidorDisponivel();
}

function opcoesPutBlob(extras = {}) {
  const token = obterTokenBlobLeituraEscrita();
  const opcoes = {
    access: obterAcessoBlob(),
    contentType: "text/html",
    addRandomSuffix: false,
    ...extras,
  };
  if (token) {
    opcoes.token = token;
  }
  return opcoes;
}

function opcoesBlobApi(extras = {}) {
  const token = obterTokenBlobLeituraEscrita();
  const opcoes = {
    access: obterAcessoBlob(),
    ...extras,
  };
  if (token) {
    opcoes.token = token;
  }
  return opcoes;
}

async function streamParaTexto(stream) {
  if (!stream) return null;
  return new Response(stream).text();
}

async function lerBlobRemoto(identificador) {
  const pathname = identificador.includes("blob.vercel-storage.com")
    ? extrairPathnameBlob(identificador)
    : identificador;

  const alvo = pathname || identificador;

  try {
    const resultado = await get(alvo, opcoesBlobApi());
    if (!resultado || resultado.statusCode !== 200) {
      return null;
    }
    return streamParaTexto(resultado.stream);
  } catch (err) {
    console.error("[blob] ler:", err?.message || err);
    return null;
  }
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
    const blob = await put(pathname, conteudo, opcoesPutBlob({
      allowOverwrite: Boolean(identificadorExistente),
    }));
    return blob.url;
  }

  if (estaNaVercel()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN não configurado. Conecte Vercel Blob em Storage e redeploy."
    );
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
    if (blobServidorDisponivel() || identificador.includes("blob.vercel-storage.com")) {
      return lerBlobRemoto(identificador);
    }
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
      await del(identificador, opcoesBlobApi());
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
      await head(identificador, opcoesBlobApi());
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
