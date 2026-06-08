"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Code2,
  Download,
  LayoutDashboard,
  Pencil,
  Trash2,
} from "lucide-react";
import { upload } from "@vercel/blob/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, useToast } from "@/components/layout/toast";
import { chamadaApi } from "@/lib/api-client";
import { usaUploadBlobClient } from "@/lib/vercel-env";
import { LIMITE_HTML_API } from "@/lib/constants";

function DialogEditarHtml({ dashboard, onFechar, onAtualizar }) {
  const { adicionar: toast } = useToast();
  const [html, setHtml] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    chamadaApi(`/dashboards/${dashboard.id}/html`)
      .then((d) => setHtml(d.html))
      .catch((e) => {
        toast(e.message, "erro");
        onFechar();
      })
      .finally(() => setCarregando(false));
  }, [dashboard.id, onFechar, toast]);

  function baixar() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dashboard.nome.replace(/[^a-zA-Z0-9_-]/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function salvar() {
    setSalvando(true);
    try {
      const usaBlob =
        usaUploadBlobClient() && new Blob([html]).size > LIMITE_HTML_API;

      if (usaBlob) {
        const arquivo = new File([html], `${dashboard.nome}.html`, {
          type: "text/html",
        });
        const nomeArquivo = `dashboards/${crypto.randomUUID()}-${dashboard.nome.replace(/[^a-zA-Z0-9._-]/g, "_")}.html`;
        const blob = await upload(nomeArquivo, arquivo, {
          access: "public",
          handleUploadUrl: "/api/dashboards/upload-url",
        });
        await chamadaApi(`/dashboards/${dashboard.id}/html`, {
          metodo: "PUT",
          corpo: { blobUrl: blob.url },
        });
      } else {
        await chamadaApi(`/dashboards/${dashboard.id}/html`, {
          metodo: "PUT",
          corpo: { html },
        });
      }

      toast("HTML atualizado com sucesso.");
      onAtualizar();
      onFechar();
    } catch (err) {
      toast(err.message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog titulo={`Editar HTML — ${dashboard.nome}`} onFechar={onFechar} largo>
      <div className="editor-dialog" style={{ display: "contents" }}>
        <div style={{ padding: "14px 20px 0" }}>
          {carregando ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
              <div className="spinner" />
            </div>
          ) : (
            <textarea
              className="editor-html-area"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              spellCheck={false}
            />
          )}
        </div>
        <div className="editor-acoes">
          <button type="button" className="botao-download" onClick={baixar} disabled={carregando}>
            <Download size={14} /> Baixar HTML
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              type="button"
              className="botao-secundario"
              style={{ width: "auto", margin: 0 }}
              onClick={onFechar}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="botao-primario"
              onClick={salvar}
              disabled={salvando || carregando}
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export function SecaoDashboards({ ehAdmin }) {
  const { adicionar: toast } = useToast();
  const [dashboards, setDashboards] = useState([]);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [editandoHtml, setEditandoHtml] = useState(null);
  const [form, setForm] = useState({ nome: "", descricao: "" });
  const [salvando, setSalvando] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const lista = await chamadaApi("/dashboards");
      setDashboards(lista);
    } catch (err) {
      toast(err.message, "erro");
    }
  }, [toast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return dashboards;
    return dashboards.filter(
      (d) =>
        (d.nome || "").toLowerCase().includes(t) ||
        (d.descricao || "").toLowerCase().includes(t)
    );
  }, [dashboards, busca]);

  function abrirEdicao(d) {
    setEditando(d.id);
    setForm({ nome: d.nome, descricao: d.descricao || "" });
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await chamadaApi(`/dashboards/${editando}`, { metodo: "PUT", corpo: form });
      toast("Dashboard atualizado.");
      setEditando(null);
      carregarDados();
    } catch (err) {
      toast(err.message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(d) {
    if (!window.confirm(`Remover permanentemente "${d.nome}"?`)) return;
    try {
      await chamadaApi("/dashboards/remover", {
        metodo: "POST",
        corpo: { idDashboard: d.id },
      });
      toast("Dashboard removido.");
      carregarDados();
    } catch (err) {
      toast(err.message, "erro");
    }
  }

  return (
    <section className="painel-dashboards">
      <div className="secao-topo">
        <div>
          <h2>Dashboards</h2>
          <p className="texto-suave pequeno">Clique em um dashboard para abrí-lo em tela cheia.</p>
        </div>
        <div className="busca-dashboards">
          <Input placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="estado-vazio">
          <LayoutDashboard size={40} className="estado-vazio-icone" />
          <p className="estado-vazio-titulo">
            {dashboards.length === 0 ? "Nenhum dashboard disponível" : "Nenhum resultado"}
          </p>
          <p className="estado-vazio-sub">
            {dashboards.length === 0
              ? "Assim que um administrador publicar um dashboard, ele aparecerá aqui."
              : "Tente outro termo de busca."}
          </p>
        </div>
      ) : (
        <div className="grade-cards-dashboards">
          {filtrados.map((d) => (
            <article key={d.id} className="card-dashboard-profissional">
              <div className="card-dashboard-body">
                <h3>{d.nome}</h3>
                {d.descricao && (
                  <p className="texto-suave pequeno card-descricao">{d.descricao}</p>
                )}
              </div>
              <div className="card-dashboard-acoes">
                <button
                  type="button"
                  className="botao-primario botao-abrir"
                  onClick={() =>
                    window.open(`/visualizador/${d.id}`, "_blank", "noopener,noreferrer")
                  }
                >
                  Abrir
                </button>
                {ehAdmin && (
                  <div className="card-acoes-admin">
                    <button
                      type="button"
                      className="botao-icone"
                      title="Editar nome/descrição"
                      onClick={() => abrirEdicao(d)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="botao-icone"
                      title="Editar / Baixar HTML"
                      onClick={() => setEditandoHtml(d)}
                    >
                      <Code2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="botao-icone perigo"
                      title="Remover"
                      onClick={() => remover(d)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {editando && (
        <Dialog titulo="Editar Dashboard" onFechar={() => setEditando(null)}>
          <form onSubmit={salvarEdicao} className="form-dialog">
            <div className="campo">
              <Label>Nome</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div className="campo">
              <Label>
                Descrição <span className="opcional">(opcional)</span>
              </Label>
              <Input
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>
            <div className="form-dialog-acoes">
              <button
                type="button"
                className="botao-secundario"
                style={{ width: "auto", margin: 0 }}
                onClick={() => setEditando(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="botao-primario" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </Dialog>
      )}

      {editandoHtml && (
        <DialogEditarHtml
          dashboard={editandoHtml}
          onFechar={() => setEditandoHtml(null)}
          onAtualizar={carregarDados}
        />
      )}
    </section>
  );
}
