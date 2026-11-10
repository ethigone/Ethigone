import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  title: { default: "ETHIGONE · Espace de démonstration", template: "%s · ETHIGONE" },
  description: "Explorez un dossier fictif de location d’équipements et le parcours investisseur envisagé par ETHIGONE.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>;
}
