import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vector EST — Gemini vs Transformers.js",
  description:
    "Compara embeddings semánticos generados por Gemini en la nube contra MiniLM-L6-v2 local en el navegador.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
