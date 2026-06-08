import { Pool } from "pg";

let pool;

/**
 * Retorna pool PostgreSQL singleton.
 * Usa DATABASE_URL ou variáveis DB_* separadas.
 */
export function getPool() {
  if (!pool) {
    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 5,
      });
    } else {
      pool = new Pool({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME || "sigma",
        user: process.env.DB_USER || "sigma",
        password: process.env.DB_PASSWORD || "sigma123",
        max: 5,
      });
    }
  }
  return pool;
}

export default getPool;
