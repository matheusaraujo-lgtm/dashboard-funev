import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SecaoPublicar } from "@/components/dashboards/secao-publicar";
import { NOME_COOKIE_TOKEN, verificarToken } from "@/lib/auth";

export default async function PublicarPage() {
  const store = await cookies();
  const token = store.get(NOME_COOKIE_TOKEN)?.value;
  const usuario = token ? verificarToken(token) : null;

  if (!usuario) redirect("/login");
  if (usuario.perfil !== "admin") redirect("/dashboards");

  return <SecaoPublicar />;
}
