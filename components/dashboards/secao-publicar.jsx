"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/layout/toast";
import { chamadaApi } from "@/lib/api-client";
import { deveUsarUploadBlobCliente } from "@/lib/upload-dashboard";

export function SecaoPublicar() {
  const { adicionar: toast } = useToast();
  const [form, setForm] = useState({ nome: "", descricao: "", arquivo: null });
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef(null);

  async function publicar(e) {
    e.preventDefault();
    if (!form.arquivo) {
      toast("Selecione um arquivo HTML.", "erro");
      return;
    }
    setEnviando(true);
    try {
      if (deveUsarUploadBlobCliente(form.arquivo.size)) {
        const nomeArquivo = `dashboards/${crypto.randomUUID()}-${form.arquivo.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const blob = await upload(nomeArquivo, form.arquivo, {
          access: "public",
          contentType: "text/html",
          handleUploadUrl: "/api/dashboards/upload-url",
        });
        await chamadaApi("/dashboards/upload", {
          metodo: "POST",
          corpo: { nome: form.nome, descricao: form.descricao, blobUrl: blob.url },
        });
      } else {
        const fd = new FormData();
        fd.append("nome", form.nome);
        fd.append("descricao", form.descricao);
        fd.append("arquivoHtml", form.arquivo);
        await chamadaApi("/dashboards/upload", { metodo: "POST", corpo: fd });
      }

      toast("Dashboard publicado com sucesso.");
      setForm({ nome: "", descricao: "", arquivo: null });
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      toast(err.message, "erro");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="cartao-padrao max-largura">
      <div className="secao-topo-simples">
        <h2>Publicar Dashboard</h2>
        <p className="texto-suave pequeno">
          Envie um arquivo .html e disponibilize para os usuários. No plano gratuito da
          Vercel, o upload vai direto ao Blob (até 20 MB).
        </p>
      </div>
      <form onSubmit={publicar} className="form-padrao">
        <div className="campo">
          <Label>Nome do dashboard</Label>
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Ex: Custeio Consolidado"
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
            placeholder="Breve descrição do conteúdo"
          />
        </div>
        <div className="campo">
          <Label>Arquivo HTML</Label>
          <label className="upload-area">
            <input
              ref={inputRef}
              type="file"
              accept=".html"
              className="upload-input-hidden"
              onChange={(e) => setForm({ ...form, arquivo: e.target.files?.[0] || null })}
              required
            />
            <div className="upload-conteudo">
              <Upload size={22} className="upload-icone" />
              {form.arquivo ? (
                <span className="upload-nome-arquivo">{form.arquivo.name}</span>
              ) : (
                <>
                  <span className="upload-texto-principal">Clique para selecionar</span>
                  <span className="upload-texto-sub">Somente arquivos .html</span>
                </>
              )}
            </div>
          </label>
        </div>
        <button type="submit" className="botao-primario botao-full" disabled={enviando}>
          <Upload size={15} />
          {enviando ? "Publicando..." : "Publicar dashboard"}
        </button>
      </form>
    </section>
  );
}
