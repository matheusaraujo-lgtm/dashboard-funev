"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/layout/toast";
import { chamadaApi } from "@/lib/api-client";

export function SecaoPermissoes() {
  const { adicionar: toast } = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [usuarioId, setUsuarioId] = useState("");
  const [permitidos, setPermitidos] = useState([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    Promise.all([chamadaApi("/usuarios"), chamadaApi("/dashboards")])
      .then(([users, dashs]) => {
        setUsuarios(users);
        setDashboards(dashs);
      })
      .catch((err) => toast(err.message, "erro"));
  }, [toast]);

  const usuarioSel = useMemo(
    () => usuarios.find((u) => u.id === usuarioId),
    [usuarios, usuarioId]
  );

  function selecionar(id) {
    setUsuarioId(id);
    const u = usuarios.find((x) => x.id === id);
    setPermitidos(u?.dashboardsPermitidos || []);
  }

  function toggle(id) {
    setPermitidos((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  async function salvar() {
    setSalvando(true);
    try {
      await chamadaApi(`/usuarios/${usuarioId}/permissoes`, {
        metodo: "PUT",
        corpo: { dashboardsPermitidos: permitidos },
      });
      toast("Permissões salvas com sucesso.");
    } catch (err) {
      toast(err.message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  const usuariosComuns = usuarios.filter((u) => u.perfil === "usuario");

  return (
    <section className="cartao-padrao max-largura">
      <div className="secao-topo-simples">
        <h2>Permissões</h2>
        <p className="texto-suave pequeno">
          Defina quais dashboards cada usuário pode visualizar.
        </p>
      </div>

      <div className="campo" style={{ marginTop: 16 }}>
        <Label>Selecione o usuário</Label>
        <select
          className="select-padrao"
          value={usuarioId}
          onChange={(e) => selecionar(e.target.value)}
        >
          <option value="">-- Selecione --</option>
          {usuariosComuns.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome} — {u.email}
            </option>
          ))}
        </select>
      </div>

      {usuarioSel && (
        <div className="bloco-permissoes">
          <p className="texto-suave pequeno">
            Dashboards liberados para <strong>{usuarioSel.nome}</strong>:
          </p>
          {dashboards.length === 0 ? (
            <p className="texto-suave pequeno" style={{ marginTop: 8 }}>
              Nenhum dashboard publicado ainda.
            </p>
          ) : (
            <div className="lista-checks">
              {dashboards.map((d) => (
                <label key={d.id} className="linha-check">
                  <input
                    type="checkbox"
                    checked={permitidos.includes(d.id)}
                    onChange={() => toggle(d.id)}
                  />
                  <span>
                    <strong>{d.nome}</strong>
                    {d.descricao && (
                      <span className="texto-suave pequeno" style={{ marginLeft: 6 }}>
                        — {d.descricao}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}
          <button
            type="button"
            className="botao-primario botao-full"
            style={{ marginTop: 14 }}
            onClick={salvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar permissões"}
          </button>
        </div>
      )}
    </section>
  );
}
