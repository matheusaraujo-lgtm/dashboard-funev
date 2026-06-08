/**
 * Logo institucional FUNEV.
 * Arquivo: public/logo-funev.png
 */
export function LogoFunev({ className = "", variant = "login" }) {
  const sizes = {
    login: { width: 140, height: 56 },
    sidebar: { width: 96, height: 38 },
    topbar: { width: 80, height: 32 },
  };

  const { width, height } = sizes[variant] || sizes.login;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-funev.png"
      alt="FUNEV — Fundação Universitária Evangélica"
      className={className}
      width={width}
      height={height}
      decoding="async"
    />
  );
}
