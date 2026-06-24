import { Lock, Sparkles } from "lucide-react";
import { ACCENT } from "../../lib/accents";
import type { PillarId, Stage } from "../../lib/types";

export function StageBadges({
  stage,
  pillar,
  className = "",
}: {
  stage: Stage;
  pillar: PillarId;
  className?: string;
}) {
  const a = ACCENT[pillar];
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span
        className={`px-2 py-0.5 rounded font-mono text-xs border ${a.border} ${a.text}`}
      >
        {stage.maxPoints} pts
      </span>
      {stage.hasAssistance ? (
        <span
          className={`text-[11px] uppercase tracking-widest font-mono ${a.text} inline-flex items-center gap-1`}
        >
          <Sparkles className="w-3 h-3" /> Com auxílio
        </span>
      ) : (
        <span className="text-[11px] uppercase tracking-widest font-mono text-white/40 inline-flex items-center gap-1">
          <Lock className="w-3 h-3" /> Sem auxílio
        </span>
      )}
      {stage.modes?.map((m) => (
        <span
          key={m}
          className={`text-[11px] px-2 py-0.5 rounded-full font-mono border ${a.border} ${a.text}`}
        >
          Modo: {m === "blocks" ? "com blocos" : "do zero"}
        </span>
      ))}
    </div>
  );
}
