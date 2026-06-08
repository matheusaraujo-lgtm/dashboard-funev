import "./globals.css";

export const metadata = {
  title: "Analytics FUNEV",
  description: "Plataforma de dashboards Analytics FUNEV",
  icons: {
    icon: "/logo-funev.png",
    apple: "/logo-funev.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
