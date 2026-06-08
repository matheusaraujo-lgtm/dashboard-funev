import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NOME_COOKIE_TOKEN, verificarToken } from "@/lib/auth";
import { PainelProvider } from "@/components/layout/painel-provider";

export default async function PainelLayout({ children }) {
  const store = await cookies();
  const token = store.get(NOME_COOKIE_TOKEN)?.value;

  if (!token) {
    redirect("/login");
  }

  const usuario = verificarToken(token);
  if (!usuario) {
    redirect("/login");
  }

  return (
    <PainelProvider usuario={usuario}>{children}</PainelProvider>
  );
}
