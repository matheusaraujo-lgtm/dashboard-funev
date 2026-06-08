CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboards (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  arquivo TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios_dashboards (
  usuario_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
  dashboard_id TEXT REFERENCES dashboards(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, dashboard_id)
);
