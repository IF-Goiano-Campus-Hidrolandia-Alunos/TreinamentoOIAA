import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Desafio de Inteligencia Artificial | OIAA",
  description:
    "Plataforma oficial do Desafio Tecnico de IA: NLP, Visao Computacional e Aprendizado de Maquina. IF Goiano - Campus Hidrolandia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen antialiased">
        <Nav />
        <main className="container py-10">{children}</main>
        <footer className="border-t border-border">
          <div className="container flex flex-col items-center justify-between gap-2 py-6 text-sm text-muted-foreground sm:flex-row">
            <span>Desafio de Inteligencia Artificial — OIAA</span>
            <span>
              Sistema de pontuacao e gerenciamento desenvolvido por{" "}
              <span className="font-semibold text-foreground">Thyago</span>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
