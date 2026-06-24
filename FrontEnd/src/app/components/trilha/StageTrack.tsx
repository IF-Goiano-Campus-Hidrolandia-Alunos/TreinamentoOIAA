import { ACCENT } from "../../lib/accents";
import { usePillarProgress } from "../../lib/use-stage-progress";
import type { PillarId, Stage, StageId } from "../../lib/types";
import { StageNode } from "./StageNode";

export function StageTrack({
  pillar,
  stages,
  activeStage,
}: {
  pillar: PillarId;
  stages: Stage[];
  activeStage?: StageId;
}) {
  const a = ACCENT[pillar];
  const { completed, total, byStage } = usePillarProgress(pillar);

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border ${a.border} ${a.bgSoft} p-4`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className={`text-[10px] uppercase tracking-widest font-mono ${a.text}`}>
              Progresso do pilar
            </div>
            <div className="font-display text-2xl text-white mt-1">
              {completed}/{total} etapas
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest font-mono text-white/40">
              Pontos possíveis
            </div>
            <div className="font-display text-2xl text-white mt-1">100</div>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full ${a.bg}`}
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      </div>

      <ol className="space-y-2" role="list" aria-label="Trilha de etapas">
        {stages.map((s) => (
          <li key={s.id}>
            <StageNode
              pillar={pillar}
              stage={s}
              progress={byStage(s.id)}
              active={activeStage === s.id}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
