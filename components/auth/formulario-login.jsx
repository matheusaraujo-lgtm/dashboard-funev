"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoFunev } from "@/components/layout/logo-funev";
import { chamadaApi } from "@/lib/api-client";

export function FormularioLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboards";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erroLogin, setErroLogin] = useState("");

  async function entrar(e) {
    e.preventDefault();
    setErroLogin("");
    setCarregando(true);
    try {
      await chamadaApi("/auth/login", {
        metodo: "POST",
        corpo: { email: email.trim(), senha },
      });
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setErroLogin(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="pagina-login">
      <div className="login-fundo" aria-hidden="true" />
      <section className="login-card">
        <div className="login-logo-area">
          <LogoFunev className="logo-login" variant="login" />
        </div>
        <div className="login-corpo">
          <h1 className="login-titulo">Acessar sistema</h1>
          <p className="login-subtitulo">Analytics FUNEV</p>
          {erroLogin && (
            <div className="alerta erro login-erro-visivel">
              <XCircle size={15} style={{ flexShrink: 0 }} />
              {erroLogin}
            </div>
          )}
          <form onSubmit={entrar} className="form-login">
            <div className="campo">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@instituicao.com"
                autoComplete="email"
                disabled={carregando}
                required
              />
            </div>
            <div className="campo">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={carregando}
                required
              />
            </div>
            <button type="submit" className="botao-login-submit" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
