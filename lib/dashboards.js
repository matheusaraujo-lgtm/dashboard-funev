import getPool from "./db";
import { removerHtml } from "./blob";

export function escaparHtmlTexto(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function aplicarTituloHtml(html, titulo) {
  const tituloSeguro = escaparHtmlTexto(titulo).trim();
  if (!tituloSeguro) return html;

  const tagTitulo = `<title>${tituloSeguro}</title>`;

  if (/<title[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title[\s\S]*?<\/title>/i, tagTitulo);
  }

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (head) => `${head}\n  ${tagTitulo}`);
  }

  return `${tagTitulo}\n${html}`;
}

export async function verificarPermissaoDashboard(usuarioId, perfil, dashboardId) {
  if (perfil === "admin") return true;

  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT 1 FROM usuarios_dashboards WHERE usuario_id = $1 AND dashboard_id = $2",
    [usuarioId, dashboardId]
  );
  return rows.length > 0;
}

export async function executarRemocaoDashboard(idInformado) {
  const id =
    idInformado == null ? "" : decodeURIComponent(String(idInformado).trim());

  if (!id) {
    return { ok: false, status: 400, erro: "Id do dashboard inválido." };
  }

  const pool = getPool();
  const { rows } = await pool.query("SELECT * FROM dashboards WHERE id = $1", [id]);
  const dashboard = rows[0];

  if (!dashboard) {
    return { ok: false, status: 404, erro: "Dashboard não encontrado." };
  }

  try {
    if (dashboard.arquivo) {
      await removerHtml(dashboard.arquivo);
    }
  } catch {
    return { ok: false, status: 500, erro: "Não foi possível apagar o arquivo HTML." };
  }

  await pool.query("DELETE FROM dashboards WHERE id = $1", [id]);
  return { ok: true, id };
}

export function mapearDashboard(row) {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    arquivo: row.arquivo,
    criadoEm: row.criado_em,
  };
}
