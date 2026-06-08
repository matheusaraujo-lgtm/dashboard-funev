"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext } from "react";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Upload,
  UserPlus,
} from "lucide-react";
import { ToastProvider } from "@/components/layout/toast";
import { LogoFunev } from "@/components/layout/logo-funev";
import { sair } from "@/lib/api-client";

const MENUS_ADMIN = [
  { id: "dashboards", titulo: "Dashboards", href: "/dashboards", icone: LayoutDashboard },
  { id: "publicar", titulo: "Publicar", href: "/publicar", icone: Upload },
  { id: "usuarios", titulo: "Usuários", href: "/usuarios", icone: UserPlus },
  { id: "permissoes", titulo: "Permissões", href: "/permissoes", icone: ShieldCheck },
];

const MENUS_USUARIO = [
  { id: "dashboards", titulo: "Dashboards", href: "/dashboards", icone: LayoutDashboard },
];

const UsuarioContext = createContext(null);

export function useUsuario() {
  return useContext(UsuarioContext);
}

export function PainelProvider({ children, usuario }) {
  const pathname = usePathname();
  const router = useRouter();
  const ehAdmin = usuario?.perfil === "admin";
  const menus = ehAdmin ? MENUS_ADMIN : MENUS_USUARIO;

  async function handleSair() {
    await sair();
    router.push("/login");
    router.refresh();
  }

  return (
    <UsuarioContext.Provider value={usuario}>
      <ToastProvider>
      <div className="app-layout">
        <aside className="sidebar-minimal">
          <div className="marca">
            <LogoFunev className="logo-sidebar" variant="sidebar" />
          </div>
          <nav>
            <p className="menu-label">Menu</p>
            {menus.map((m) => {
              const Icone = m.icone;
              const ativo = pathname === m.href;
              return (
                <Link
                  key={m.id}
                  href={m.href}
                  className={`menu-item${ativo ? " ativo" : ""}`}
                >
                  <Icone size={16} />
                  {m.titulo}
                </Link>
              );
            })}
          </nav>
          <div className="usuario-box">
            <p className="nome-usuario">{usuario?.nome}</p>
            <p className="texto-suave pequeno">{usuario?.email}</p>
            <span className={`badge-perfil ${usuario?.perfil}`}>{usuario?.perfil}</span>
            <button type="button" className="botao-secundario" onClick={handleSair}>
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </aside>

        <header className="topbar-mobile">
          <LogoFunev className="logo-topbar" variant="topbar" />
          <div className="topbar-direita">
            <span className="topbar-nome">{usuario?.nome?.split(" ")[0]}</span>
            <button type="button" className="botao-sair-topbar" onClick={handleSair} title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="conteudo-minimal">{children}</main>

        {menus.length > 1 && (
          <nav className="bottomnav">
            {menus.map((m) => {
              const Icone = m.icone;
              const ativo = pathname === m.href;
              return (
                <Link
                  key={m.id}
                  href={m.href}
                  className={`bottomnav-item${ativo ? " ativo" : ""}`}
                >
                  <Icone size={20} />
                  <span>{m.titulo}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </ToastProvider>
    </UsuarioContext.Provider>
  );
}
