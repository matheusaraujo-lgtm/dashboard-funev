import { Suspense } from "react";
import { FormularioLogin } from "@/components/auth/formulario-login";

function LoginFallback() {
  return (
    <main className="pagina-login">
      <div className="login-fundo" aria-hidden="true" />
      <section className="login-card">
        <div className="login-corpo">
          <p className="login-subtitulo">Carregando...</p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <FormularioLogin />
    </Suspense>
  );
}
