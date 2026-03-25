/**
 * Layout raíz de la aplicación Next.js.
 *
 * Define los metadatos globales y aplica la fuente Moeve Sans a todo el árbol
 * de componentes a través de globals.css (declarada como @font-face y asignada
 * a --font-sans en @theme).
 *
 * No importa fuentes de Google Fonts para evitar dependencias externas:
 * los archivos .otf viven en /public/fonts/ y se sirven estáticamente.
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Syntropic",
  description:
    "Herramienta de investigación UX para interactuar con usuarios sintéticos basados en perfiles de comportamiento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
