"use client";

import { SecaoUsuarios } from "@/components/dashboards/secao-usuarios";
import { useUsuario } from "@/components/layout/painel-provider";

export default function UsuariosPage() {
  const usuario = useUsuario();
  return <SecaoUsuarios usuarioLogado={usuario} />;
}
