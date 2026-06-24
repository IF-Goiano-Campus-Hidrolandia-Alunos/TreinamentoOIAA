import Link from "next/link";
import { getAllChallenges } from "@/lib/challenges";
import { ACCENT } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PHASES = [
  {
    n: "1a Fase",
    title: "Documentacao da IA e suas funcionalidades",
    desc: "Entendimento dos tres desafios, conceitos e estrutura. Fase atual concluida.",
    status: "Concluida",
  },
  {
    n: "2a Fase",
    title: "Estrutura de Codigo-Bruto",
    desc: "Montagem dos blocos logicos do algoritmo a partir do esqueleto fornecido.",
    status: "Em andamento",
  },
  {
    n: "3a Fase",
    title: "Avaliacao e Placar de Pontuacao",
    desc: "Pontuacao por grupo e integrantes (nota individual + media do grupo).",
    status: "Planejada",
  },
];

export default function HomePage() {
  const challenges = getAllChallenges();

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center">
        <Badge className="border-primary/40 text-primary">IF Goiano — Campus Hidrolandia</Badge>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Desafio de <span className="text-primary">Inteligencia Artificial</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Tres pilares, uma jornada: Processamento de Linguagem Natural, Visao Computacional e
          Aprendizado de Maquina. Documente, construa e dispute o placar.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/challenges" className={buttonVariants()}>
            Ver os desafios
          </Link>
          <Link href="/leaderboard" className={buttonVariants({ variant: "outline" })}>
            Placar de pontuacao
          </Link>
        </div>
      </section>

      {/* Fases */}
      <section>
        <h2 className="text-center text-2xl font-bold">Estrutura do Projeto — 3 Fases</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PHASES.map((p) => (
            <Card key={p.n}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">{p.n}</span>
                  <Badge className="text-muted-foreground">{p.status}</Badge>
                </div>
                <CardTitle className="text-base">{p.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{p.desc}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pilares */}
      <section>
        <h2 className="text-center text-2xl font-bold">Os Tres Desafios Academicos</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {challenges.map((c) => {
            const a = ACCENT[c.id];
            return (
              <Link key={c.id} href="/challenges" className="group">
                <Card className={cn("h-full transition-shadow hover:shadow-lg", a.border, a.glow)}>
                  <CardHeader>
                    <Badge className={cn(a.text, a.border)}>{c.abbr}</Badge>
                    <CardTitle className={cn("mt-2", a.text)}>{c.challengeTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{c.tagline}</p>
                    <p className={cn("mt-4 text-sm font-medium", a.text)}>{c.name} →</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
