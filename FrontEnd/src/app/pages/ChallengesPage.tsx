import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Database, Lightbulb } from "lucide-react";
import { ACCENT } from "../lib/accents";
import { getAllChallenges, PILLARS } from "../lib/challenges";
import { getStages, PILLAR_ORDER } from "../lib/stages";
import { usePillarProgress } from "../lib/use-stage-progress";
import type { PillarId } from "../lib/types";

export function ChallengesPage() {
  const challenges = getAllChallenges();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
        Desafios
      </div>
      <h1 className="font-display text-4xl text-white mt-2">
        Três pilares, quinze etapas
      </h1>
      <p className="mt-3 text-white/60 max-w-2xl">
        Cada pilar entrega 100 pontos por integrante. Some os três pilares: 300
        pontos por aluno. Escolha um pilar para entrar na trilha.
      </p>

      <div className="mt-10 grid gap-6">
        {PILLAR_ORDER.map((id, idx) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
          >
            <PillarOverview pillar={id} challenge={challenges.find((c) => c.pillar === id)!} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PillarOverview({
  pillar,
  challenge,
}: {
  pillar: PillarId;
  challenge: ReturnType<typeof getAllChallenges>[number];
}) {
  const a = ACCENT[pillar];
  const stages = getStages(pillar).stages;
  const { completed } = usePillarProgress(pillar);

  return (
    <div
      className={`relative rounded-2xl border ${a.border} bg-gradient-to-br ${a.fromTo} p-6 sm:p-8 overflow-hidden`}
    >
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="relative grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <div className={`text-xs uppercase tracking-widest font-mono ${a.text}`}>
            Pilar · {PILLARS[pillar].shortName}
          </div>
          <h2 className="mt-2 font-display text-3xl text-white">
            {challenge.title}
          </h2>
          <p className="mt-3 text-white/70 max-w-2xl">{challenge.narrative}</p>

          <div className="mt-5 grid sm:grid-cols-2 gap-3 max-w-2xl">
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-white/40">
                <Lightbulb className="w-3 h-3" /> Conceitos
              </div>
              <div className="mt-1 text-sm text-white/80 line-clamp-2">
                {challenge.keyConcepts.map((c) => c.term).join(" · ")}
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-white/40">
                <Database className="w-3 h-3" /> Dataset
              </div>
              <div className="mt-1 text-sm text-white/80 line-clamp-2">
                {challenge.dataset}
              </div>
            </div>
          </div>

          <Link
            to={`/challenges/${pillar}`}
            className={`mt-6 inline-flex items-center gap-2 rounded-md border ${a.border} ${a.bgSoft} px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-all group`}
          >
            Ver trilha das 5 etapas
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className={`rounded-xl border ${a.border} bg-[#0c0c12]/60 p-5`}>
          <div className={`text-[10px] uppercase tracking-widest font-mono ${a.text}`}>
            Trilha
          </div>
          <div className="font-display text-2xl text-white mt-1">
            {completed}/5 etapas
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full ${a.bg}`} style={{ width: `${(completed / 5) * 100}%` }} />
          </div>
          <ul className="mt-4 space-y-1.5">
            {stages.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/challenges/${pillar}/${s.id}`}
                  className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-white/5 text-xs"
                >
                  <span className="text-white/70 truncate">
                    <span className={a.text}>{s.order}.</span> {s.title.replace(/^\d+\.\s*/, "")}
                  </span>
                  <span className="text-white/40 font-mono">{s.maxPoints}p</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
