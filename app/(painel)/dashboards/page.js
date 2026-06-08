import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SecaoDashboards } from "@/components/dashboards/secao-dashboards";
import { NOME_COOKIE_TOKEN, verificarToken } from "@/lib/auth";

export default async function DashboardsPage() {
  const store = await cookies();
  const token = store.get(NOME_COOKIE_TOKEN)?.value;
  const usuario = token ? verificarToken(token) : null;

  if (!usuario) redirect("/login");

  return <SecaoDashboards ehAdmin={usuario.perfil === "admin"} />;
}
