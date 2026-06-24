import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Cpu, Sparkles } from "lucide-react";
import capivara from "../../imports/capivara.png";
import { PILLARS } from "../lib/challenges";
import { PILLAR_ORDER } from "../lib/stages";
import { PillarCard } from "../components/pillars/PillarCard";

const phases = [
  {
    n: 1,
    title: "Documentação",
    body: "Mapeamento dos três pilares, definição das 5 etapas e dos pesos por etapa.",
    status: "done" as const,
  },
  {
    n: 2,
    title: "Estrutura de Código-Bruto",
    body: "Esqueletos em Python com lacunas e materiais de apoio para os times.",
    status: "active" as const,
  },
  {
    n: 3,
    title: "Avaliação e Placar",
    body: "Tutor lança notas no painel admin e o placar atualiza em tempo real.",
    status: "done" as const,
  },
];

export function HomePage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="absolute inset-0 cyber-radial" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-28">
          {/* Mascote (capivara cyberpunk) no lado direito do hero.
              Máscara radial + glow fundem o fundo escuro da arte ao hero,
              dando o efeito de fundo transparente sem editar o PNG. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 lg:block"
            aria-hidden="true"
          >
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-full bg-violet-500/20 blur-3xl" />
              <motion.img
                src={capivara}
                alt=""
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-[clamp(320px,32vw,460px)] drop-shadow-[0_0_60px_rgba(139,92,246,0.45)]"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(circle at 50% 46%, #000 56%, transparent 74%)",
                  maskImage:
                    "radial-gradient(circle at 50% 46%, #000 56%, transparent 74%)",
                }}
              />
            </div>
          </motion.div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/60 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            IF Goiano · Campus Hidrolândia · Edição 2026
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05]"
          >
            Desafio de
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Inteligência Artificial
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-2xl text-white/60 text-lg"
          >
            Três pilares acadêmicos, quinze etapas, três fases. Uma plataforma
            para times de estudantes treinarem, competirem e construírem IA do
            zero — guiados pelo tutor.
          </motion.p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/challenges"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-md bg-white text-black text-sm hover:bg-white/90 transition-all"
            >
              Explorar os desafios
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-white/15 text-white text-sm hover:bg-white/5 transition-all"
            >
              Ver placar ao vivo
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-4 max-w-xl text-center">
            {[
              { v: "3", l: "Pilares" },
              { v: "15", l: "Etapas" },
              { v: "300", l: "Pontos / aluno" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="font-display text-3xl text-white">{s.v}</div>
                <div className="text-xs uppercase tracking-widest text-white/40 mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
              Roadmap
            </div>
            <h2 className="font-display text-3xl text-white mt-2">Três Fases</h2>
          </div>
          <Cpu className="w-8 h-8 text-white/20" />
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4 relative">
          <div className="hidden md:block absolute top-12 left-8 right-8 h-px bg-gradient-to-r from-violet-500/40 via-cyan-400/40 to-emerald-400/40" />
          {phases.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-xl border border-white/10 bg-[#0c0c12] p-6 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display text-white">
                  {p.n}
                </div>
                <div className="font-display text-white text-lg">{p.title}</div>
              </div>
              <p className="mt-4 text-sm text-white/60">{p.body}</p>
              <div className="mt-5 flex items-center gap-2 text-xs">
                {p.status === "done" ? (
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Concluída
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                    Em andamento
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
          Os três pilares
        </div>
        <h2 className="font-display text-3xl text-white mt-2">
          Escolha sua frente de batalha
        </h2>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {PILLAR_ORDER.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <PillarCard pillar={PILLARS[id]} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
