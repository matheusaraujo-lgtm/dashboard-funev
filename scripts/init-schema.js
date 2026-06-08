/**
 * Inicializa o schema PostgreSQL (executar uma vez).
 * Uso: npm run db:init
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

function criarPool() {
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || "sigma",
    user: process.env.DB_USER || "sigma",
    password: process.env.DB_PASSWORD || "sigma123",
  });
}

async function initSchema() {
  const pool = criarPool();

  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");

  try {
    await pool.query(sql);
    console.log("Schema inicializado com sucesso.");
  } catch (err) {
    console.error("Erro ao inicializar schema:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initSchema();
