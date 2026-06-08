const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const { rows } = await pool.query(
    "SELECT id, email, perfil FROM usuarios ORDER BY email"
  );
  console.log("Usuarios no banco:", rows);

  const admin = rows.find((u) => u.email === "admin@sigma.local");
  if (!admin) {
    console.log("ERRO: admin@sigma.local nao encontrado");
    process.exit(1);
  }

  const { rows: hashRows } = await pool.query(
    "SELECT senha_hash FROM usuarios WHERE email = $1",
    ["admin@sigma.local"]
  );
  const senhaNova = "FunevAnalytics2026!";
  const hash = bcrypt.hashSync(senhaNova, 12);
  await pool.query("UPDATE usuarios SET senha_hash = $1 WHERE email = $2", [
    hash,
    "admin@sigma.local",
  ]);
  console.log("Senha do admin redefinida para:", senhaNova);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
