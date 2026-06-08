/**
 * Importa dados do banco.json legado para PostgreSQL.
 * Uso: npm run db:migrar
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const caminhoBanco = path.join(__dirname, "dados", "banco.json");

async function migrar() {
  if (!fs.existsSync(caminhoBanco)) {
    console.log("banco.json não encontrado, nada para migrar.");
    process.exit(0);
  }

  const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      })
    : new Pool({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME || "sigma",
        user: process.env.DB_USER || "sigma",
        password: process.env.DB_PASSWORD || "sigma123",
      });

  const banco = JSON.parse(fs.readFileSync(caminhoBanco, "utf-8"));
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const u of banco.usuarios) {
      await client.query(
        `INSERT INTO usuarios (id, nome, email, senha_hash, perfil)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.nome, u.email, u.senhaHash, u.perfil]
      );
    }
    console.log(`${banco.usuarios.length} usuários migrados.`);

    for (const d of banco.dashboards) {
      await client.query(
        `INSERT INTO dashboards (id, nome, descricao, arquivo, criado_em)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [d.id, d.nome, d.descricao || "", d.arquivo, d.criadoEm]
      );
    }
    console.log(`${banco.dashboards.length} dashboards migrados.`);

    for (const u of banco.usuarios) {
      if (Array.isArray(u.dashboardsPermitidos) && u.dashboardsPermitidos.length > 0) {
        for (const dashboardId of u.dashboardsPermitidos) {
          await client.query(
            `INSERT INTO usuarios_dashboards (usuario_id, dashboard_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [u.id, dashboardId]
          );
        }
      }
    }
    console.log("Permissões migradas.");

    await client.query("COMMIT");
    console.log("Migração concluída com sucesso!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro na migração:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrar();
