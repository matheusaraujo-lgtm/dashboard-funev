"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/layout/toast";
import { chamadaApi } from "@/lib/api-client";

export function SecaoUsuarios({ usuarioLogado }) {
  const { adicionar: toast } = useToast();
  const FORM_VAZIO = { nome: "", email: "", senha: "", perfil: "usuario" };
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const users = await chamadaApi("/usuarios");
      setUsuarios(users);
    } catch (err) {
      toast(err.message, "erro");
    }
  }, [toast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function abrirEdicao(u) {
    setEditandoId(u.id);
    setForm({ nome: u.nome, email: u.email, senha: "", perfil: u.perfil });
    setTimeout(() => {
      document.getElementById("form-usuario")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editandoId) {
        await chamadaApi(`/usuarios/${editandoId}`, { metodo: "PUT", corpo: form });
        toast("Usuário atualizado.");
        cancelarEdicao();
      } else {
        await chamadaApi("/usuarios", { metodo: "POST", corpo: form });
        toast("Usuário criado com sucesso.");
        setForm(FORM_VAZIO);
      }
      carregarDados();
    } catch (err) {
      toast(err.message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(u) {
    if (!window.confirm(`Excluir "${u.nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await chamadaApi(`/usuarios/${u.id}`, { metodo: "DELETE" });
      toast("Usuário excluído.");
      carregarDados();
    } catch (err) {
      toast(err.message, "erro");
    }
  }

  return (
    <section className="cartao-padrao max-largura">
      <div className="secao-topo-simples">
        <h2>Usuários</h2>
        <p className="texto-suave pequeno">Gerencie as contas de acesso ao sistema.</p>
      </div>

      <div className="tabela-wrapper">
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th className="col-email">E-mail</th>
              <th>Perfil</th>
              <th style={{ width: 90 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="tabela-vazia">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id} className={editandoId === u.id ? "linha-editando" : ""}>
                  <td>
                    <strong>{u.nome}</strong>
                    <span className="email-mobile texto-suave pequeno">{u.email}</span>
                  </td>
                  <td className="col-email texto-suave">{u.email}</td>
                  <td>
                    <span className={`badge-perfil ${u.perfil}`}>{u.perfil}</span>
                  </td>
                  <td className="acoes-tabela">
                    <button type="button" className="botao-icone" title="Editar" onClick={() => abrirEdicao(u)}>
                      <Pencil size={14} />
                    </button>
                    {u.id !== usuarioLogado.id && (
                      <button type="button" className="botao-icone perigo" title="Excluir" onClick={() => remover(u)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="form-secao" id="form-usuario">
        <h3 className="form-secao-titulo">
          {editandoId ? (
            <>
              <Pencil size={15} /> Editar Usuário
            </>
          ) : (
            <>
              <Plus size={15} /> Novo Usuário
            </>
          )}
        </h3>
        <form onSubmit={salvar} className="form-padrao form-grid">
          <div className="campo">
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome completo"
              required
            />
          </div>
          <div className="campo">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nome@instituicao.com"
              required
            />
          </div>
          <div className="campo">
            <Label>
              {editandoId ? "Nova senha" : "Senha"}
              {editandoId && <span className="opcional"> (em branco = manter)</span>}
            </Label>
            <Input
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              placeholder={editandoId ? "••••••• (opcional)" : "Mínimo 6 caracteres"}
              required={!editandoId}
            />
          </div>
          <div className="campo">
            <Label>Perfil</Label>
            <select
              className="select-padrao"
              value={form.perfil}
              onChange={(e) => setForm({ ...form, perfil: e.target.value })}
            >
              <option value="usuario">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="form-acoes">
            {editandoId && (
              <button type="button" className="botao-secundario" onClick={cancelarEdicao}>
                Cancelar
              </button>
            )}
            <button type="submit" className="botao-primario" disabled={salvando}>
              {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Criar usuário"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
