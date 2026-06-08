/**
 * Redefine senha de um usuário.
 * Uso: node --env-file=.env.local scripts/redefinir-senha.js email novaSenha
 */
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const [email, senha] = process.argv.slice(2);

if (!email || !senha) {
  console.error("Uso: node --env-file=.env.local scripts/redefinir-senha.js email novaSenha");
  process.exit(1);
}

async function redefinir() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const hash = bcrypt.hashSync(senha, 12);
  const { rowCount } = await pool.query(
    "UPDATE usuarios SET senha_hash = $1 WHERE email = $2",
    [hash, email.toLowerCase().trim()]
  );

  if (rowCount === 0) {
    console.error("Usuário não encontrado:", email);
    process.exit(1);
  }

  console.log("Senha atualizada para:", email);
  await pool.end();
}

redefinir().catch((err) => {
  console.error(err);
  process.exit(1);
});
