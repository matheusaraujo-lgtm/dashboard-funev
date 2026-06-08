const API_BASE = "/api";

/**
 * Cliente HTTP para chamadas à API interna.
 * Usa cookies httpOnly (credentials: include) — token Bearer é opcional.
 */
export async function chamadaApi(caminho, { metodo = "GET", corpo, cabecalhos = {} } = {}) {
  const opcoes = {
    method: metodo,
    credentials: "include",
    headers: { ...cabecalhos },
  };

  if (corpo && !(corpo instanceof FormData)) {
    opcoes.headers["Content-Type"] = "application/json";
    opcoes.body = JSON.stringify(corpo);
  }
  if (corpo instanceof FormData) {
    opcoes.body = corpo;
  }

  let resposta;
  try {
    resposta = await fetch(`${API_BASE}${caminho}`, opcoes);
  } catch (e) {
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      throw new Error("Sem conexão com a internet.");
    }
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  }

  const texto = await resposta.text();
  let dados = {};
  try {
    dados = texto ? JSON.parse(texto) : {};
  } catch {
    dados = {};
  }

  if (!resposta.ok) {
    throw new Error(dados.erro || `Erro ${resposta.status}`);
  }

  return dados;
}

export async function obterUsuarioAtual() {
  try {
    return await chamadaApi("/auth/me");
  } catch {
    return null;
  }
}

export async function sair() {
  await chamadaApi("/auth/logout", { metodo: "POST" });
}
