import crypto from "crypto";
import getPool from "@/lib/db";
import { autenticarRequisicao, exigirAdmin } from "@/lib/auth";
import {
  aplicarTituloHtml,
} from "@/lib/dashboards";
import { salvarHtml, lerHtml, gerarNomeArquivo } from "@/lib/blob";
import { withApiRateLimit, jsonErro, jsonOk } from "@/lib/api-helpers";

/**
 * Registra metadados do dashboard após upload do HTML.
 * Aceita:
 * - { nome, descricao, blobUrl } — upload via Vercel Blob (client)
 * - FormData com arquivoHtml — fallback local/desenvolvimento
 */
export async function POST(request) {
  return withApiRateLimit(request, async () => {
    const auth = await autenticarRequisicao(request);
    if (auth.erro) return jsonErro(auth.erro, auth.status);

    const admin = exigirAdmin(auth.usuario);
    if (admin) return jsonErro(admin.erro, admin.status);

    const contentType = request.headers.get("content-type") || "";

    try {
      let nome;
      let descricao = "";
      let identificadorArquivo;
      let htmlOriginal;

      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        nome = formData.get("nome");
        descricao = formData.get("descricao") || "";
        const arquivo = formData.get("arquivoHtml");

        if (!arquivo || typeof arquivo === "string") {
          return jsonErro("Arquivo HTML obrigatório.");
        }
        if (!nome) {
          return jsonErro("Nome do dashboard é obrigatório.");
        }
        if (!arquivo.name.toLowerCase().endsWith(".html")) {
          return jsonErro("Somente arquivos HTML são permitidos.");
        }
        if (arquivo.size > 20 * 1024 * 1024) {
          return jsonErro("Arquivo muito grande (máx 20 MB).");
        }

        htmlOriginal = await arquivo.text();
        const nomeArquivo = gerarNomeArquivo(arquivo.name);
        const tituloHtml = (descricao || nome).trim();
        const htmlFinal = aplicarTituloHtml(htmlOriginal, tituloHtml);
        identificadorArquivo = await salvarHtml(nomeArquivo, htmlFinal);
      } else {
        const corpo = await request.json();
        nome = corpo.nome;
        descricao = corpo.descricao || "";
        const blobUrl = corpo.blobUrl;

        if (!nome) {
          return jsonErro("Nome do dashboard é obrigatório.");
        }
        if (!blobUrl) {
          return jsonErro("URL do blob é obrigatória.");
        }

        htmlOriginal = await lerHtml(blobUrl);
        if (!htmlOriginal) {
          return jsonErro("Não foi possível ler o arquivo enviado.");
        }

        const tituloHtml = (descricao || nome).trim();
        const htmlFinal = aplicarTituloHtml(htmlOriginal, tituloHtml);

        identificadorArquivo = blobUrl;
        if (htmlFinal !== htmlOriginal) {
          await salvarHtml(gerarNomeArquivo(`${nome}.html`), htmlFinal, blobUrl);
        }
      }

      const pool = getPool();
      const id = crypto.randomUUID();
      const criadoEm = new Date().toISOString();

      await pool.query(
        "INSERT INTO dashboards (id, nome, descricao, arquivo, criado_em) VALUES ($1, $2, $3, $4, $5)",
        [id, nome, descricao || "", identificadorArquivo, criadoEm]
      );

      return jsonOk(
        {
          id,
          nome,
          descricao: descricao || "",
          arquivo: identificadorArquivo,
          criadoEm,
        },
        201
      );
    } catch (err) {
      console.error("[upload]", err?.message || err);
      const texto = String(err?.message || "");
      let msg = "Erro interno.";
      if (texto.includes("BLOB_READ_WRITE_TOKEN") || texto.includes("BLOB_STORE_ID")) {
        msg = texto;
      } else if (texto.includes("Blob") || texto.includes("blob") || texto.includes("Access denied")) {
        msg = `Falha ao gravar no Vercel Blob: ${texto}`;
      }
      return jsonErro(msg, 500);
    }
  });
}
