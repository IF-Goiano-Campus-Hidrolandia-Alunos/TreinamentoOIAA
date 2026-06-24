import { Link, Navigate, useParams } from "react-router";
import { Brain, ChevronRight } from "lucide-react";
import { ACCENT } from "../lib/accents";
import { getChallenge, PILLARS } from "../lib/challenges";
import { getStages } from "../lib/stages";
import type { PillarId } from "../lib/types";
import { StageTrack } from "../components/trilha/StageTrack";

const VALID: PillarId[] = ["nlp", "vc", "am"];

export function PillarTrailPage() {
  const { pillar } = useParams<{ pillar: string }>();
  if (!pillar || !VALID.includes(pillar as PillarId)) {
    return <Navigate to="/challenges" replace />;
  }
  const p = pillar as PillarId;
  const challenge = getChallenge(p);
  const { stages } = getStages(p);
  const a = ACCENT[p];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
        <Link to="/challenges" className="hover:text-white">Desafios</Link>
        <ChevronRight className="w-3 h-3" />
        <span className={a.text}>{PILLARS[p].shortName}</span>
      </div>

      <div className={`mt-6 rounded-xl border ${a.border} bg-gradient-to-br ${a.fromTo} p-8`}>
        <div className={`text-[10px] uppercase tracking-widest font-mono ${a.text}`}>
          {PILLARS[p].name}
        </div>
        <h1 className="mt-2 font-display text-4xl text-white">{challenge.title}</h1>
        <p className="mt-3 text-white/70 max-w-3xl">{challenge.narrative}</p>
      </div>

      <div className="mt-8 grid lg:grid-cols-[360px_1fr] gap-8">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <StageTrack pillar={p} stages={stages} />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 font-mono">
              <Brain className="w-3.5 h-3.5" /> Como funciona a trilha
            </div>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><span className={a.text}>▸</span> Cada etapa entrega seus próprios pontos. Some 100 pts por pilar.</li>
              <li><span className={a.text}>▸</span> Etapas 1 e 2 vêm com auxílio (dicas). As demais, não.</li>
              <li><span className={a.text}>▸</span> A nota oficial é lançada pelo tutor em <Link to="/admin" className="underline">/admin</Link>.</li>
              <li><span className={a.text}>▸</span> O placar consolida tudo em <Link to="/leaderboard" className="underline">/placar</Link>.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-6">
            <div className="text-xs uppercase tracking-widest text-white/40 font-mono">Comece por</div>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              {stages.slice(0, 2).map((s) => (
                <Link
                  key={s.id}
                  to={`/challenges/${p}/${s.id}`}
                  className={`rounded-lg border ${a.border} ${a.bgSoft} p-4 hover:bg-white/5 transition-all`}
                >
                  <div className={`text-[10px] uppercase tracking-widest font-mono ${a.text}`}>
                    Etapa {s.order}
                  </div>
                  <div className="font-display text-white mt-1">{s.title}</div>
                  <div className="text-xs text-white/60 mt-1">{s.short}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
