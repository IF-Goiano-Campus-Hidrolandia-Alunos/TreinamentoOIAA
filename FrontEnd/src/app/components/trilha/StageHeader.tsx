import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ACCENT } from "../../lib/accents";
import { PILLARS } from "../../lib/challenges";
import { STAGE_ORDER, getStage } from "../../lib/stages";
import type { PillarId, Stage } from "../../lib/types";
import { StageBadges } from "./StageBadges";

export function StageHeader({
  pillar,
  stage,
  completedCount,
}: {
  pillar: PillarId;
  stage: Stage;
  completedCount: number;
}) {
  const a = ACCENT[pillar];
  const idx = STAGE_ORDER.indexOf(stage.id);
  const prev = idx > 0 ? getStage(STAGE_ORDER[idx - 1]) : null;
  const next = idx < STAGE_ORDER.length - 1 ? getStage(STAGE_ORDER[idx + 1]) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
        <Link to="/challenges" className="hover:text-white">Desafios</Link>
        <span>/</span>
        <Link to={`/challenges/${pillar}`} className={`hover:text-white ${a.text}`}>
          {PILLARS[pillar].shortName}
        </Link>
        <span>/</span>
        <span className="text-white/70">Etapa {stage.order}</span>
      </div>

      <div
        className={`rounded-xl border ${a.border} bg-gradient-to-br ${a.fromTo} p-6 sm:p-8`}
      >
        <div className={`text-[10px] uppercase tracking-widest ${a.text} font-mono`}>
          {PILLARS[pillar].name} · Etapa {stage.order} de 5
        </div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl text-white">
          {stage.title}
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl">{stage.goal}</p>
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <StageBadges stage={stage} pillar={pillar} />
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest font-mono text-white/40">
              Progresso do pilar
            </div>
            <div className="font-display text-white">{completedCount}/5 etapas</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">
        {prev ? (
          <Link
            to={`/challenges/${pillar}/${prev.id}`}
            className="inline-flex items-center gap-1 text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/challenges/${pillar}/${next.id}`}
            className="inline-flex items-center gap-1 text-white/60 hover:text-white"
          >
            {next.title} <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
