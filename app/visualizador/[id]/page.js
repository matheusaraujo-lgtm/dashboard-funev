"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { X } from "lucide-react";
import { chamadaApi } from "@/lib/api-client";

export default function VisualizadorPage() {
  const params = useParams();
  const id = params.id;
  const [erro, setErro] = useState("");
  const [html, setHtml] = useState("");
  const [titulo, setTitulo] = useState("");

  useEffect(() => {
    chamadaApi(`/dashboards/${id}/conteudo`)
      .then((d) => {
        const t = d.descricao || d.nome || "Dashboard";
        document.title = t;
        setTitulo(t);
        setHtml(d.html);
      })
      .catch((e) => setErro(e.message));
  }, [id]);

  return (
    <main className="pagina-externa-full">
      {html && (
        <div className="visualizador-topbar">
          <button type="button" className="visualizador-voltar" onClick={() => window.close()}>
            <X size={18} /> Fechar
          </button>
          <span className="visualizador-titulo">{titulo}</span>
        </div>
      )}
      {erro && <p className="alerta erro alerta-flutuante">{erro}</p>}
      {html ? (
        <iframe
          title="dashboard"
          srcDoc={html}
          className="externa-frame-full"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      ) : !erro ? (
        <div className="externa-carregando">
          <div className="spinner" />
          <span>Carregando dashboard...</span>
        </div>
      ) : null}
    </main>
  );
}
