/**
 * Atualiza dashboards.arquivo para arquivos HTML que existem em scripts/dados/dashboards.
 * Uso: node --env-file=.env.local scripts/sincronizar-arquivos.js
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const PASTA = path.join(__dirname, "dados", "dashboards");

const MAPEAMENTOS = [
  {
    dashboardId: "52863d41-4180-4b61-9eef-2ebce90453d6",
    arquivo: "67ed7001-d5cc-4511-89b4-da5476c7ab5c-dashboard_gestao_metas_funev_atual.html",
  },
  {
    dashboardId: "765bbca0-2bc1-4fe2-9142-4510c4bbdc0e",
    arquivo: "1725d5c8-1ed1-414e-9ce7-0ac7fda2edeb-Acompanhamento_de_Custeio_-_HMAA.html",
  },
];

async function sincronizar() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const arquivos = fs.readdirSync(PASTA).filter((f) => f.endsWith(".html"));
  console.log(`Arquivos locais: ${arquivos.length}`);

  for (const { dashboardId, arquivo } of MAPEAMENTOS) {
    if (!arquivos.includes(arquivo)) {
      console.warn(`Arquivo não encontrado: ${arquivo}`);
      continue;
    }
    await pool.query("UPDATE dashboards SET arquivo = $1 WHERE id = $2", [arquivo, dashboardId]);
    console.log(`Atualizado ${dashboardId} → ${arquivo}`);
  }

  const { rows } = await pool.query("SELECT id, nome, arquivo FROM dashboards ORDER BY nome");
  console.log("\nDashboards no banco:");
  rows.forEach((d) => {
    const existe = arquivos.includes(d.arquivo) || d.arquivo.startsWith("http");
    console.log(`  ${existe ? "OK" : "FALTA"} | ${d.nome} | ${d.arquivo}`);
  });

  await pool.end();
}

sincronizar().catch((err) => {
  console.error(err);
  process.exit(1);
});
