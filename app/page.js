import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NOME_COOKIE_TOKEN } from "@/lib/auth";

export default async function HomePage() {
  const store = await cookies();
  const token = store.get(NOME_COOKIE_TOKEN)?.value;

  if (token) {
    redirect("/dashboards");
  }
  redirect("/login");
}
