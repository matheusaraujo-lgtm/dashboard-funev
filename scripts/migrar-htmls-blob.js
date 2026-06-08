/**
 * Envia HTMLs locais para Vercel Blob e atualiza dashboards.arquivo.
 * Uso: npm run blob:migrar
 * Requer: BLOB_READ_WRITE_TOKEN e DATABASE_URL
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { put } = require("@vercel/blob");

const PASTA_HTML = path.join(__dirname, "dados", "dashboards");

async function migrarHtmls() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN não definido.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const { rows: dashboards } = await pool.query("SELECT id, arquivo FROM dashboards");

  let migrados = 0;

  for (const dash of dashboards) {
    if (dash.arquivo.startsWith("http")) {
      console.log(`Dashboard ${dash.id}: já usa Blob, ignorando.`);
      continue;
    }

    const caminhoLocal = path.join(PASTA_HTML, dash.arquivo);
    if (!fs.existsSync(caminhoLocal)) {
      console.warn(`Arquivo não encontrado: ${dash.arquivo}`);
      continue;
    }

    const conteudo = fs.readFileSync(caminhoLocal, "utf-8");
    const nomeBlob = `dashboards/${dash.arquivo}`;

    const blob = await put(nomeBlob, conteudo, {
      access: "public",
      contentType: "text/html",
      addRandomSuffix: false,
    });

    await pool.query("UPDATE dashboards SET arquivo = $1 WHERE id = $2", [blob.url, dash.id]);
    console.log(`Migrado: ${dash.arquivo} → ${blob.url}`);
    migrados += 1;
  }

  console.log(`Migração concluída. ${migrados} arquivo(s) enviado(s) ao Blob.`);
  await pool.end();
}

migrarHtmls().catch((err) => {
  console.error(err);
  process.exit(1);
});
