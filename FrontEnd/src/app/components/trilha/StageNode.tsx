import { Link } from "react-router";
import { Check, Lock, Sparkles } from "lucide-react";
import { ACCENT } from "../../lib/accents";
import type { PillarId, Stage, StageProgress } from "../../lib/types";

type State = "available" | "in-progress" | "done";

export function StageNode({
  pillar,
  stage,
  progress,
  active,
}: {
  pillar: PillarId;
  stage: Stage;
  progress: StageProgress | null;
  active: boolean;
}) {
  const a = ACCENT[pillar];
  const state: State = progress?.completed
    ? "done"
    : progress?.updatedAt
      ? "in-progress"
      : "available";

  const ring =
    active
      ? `${a.border} ${a.glow}`
      : state === "done"
        ? `${a.border} ${a.bgSoft}`
        : state === "in-progress"
          ? `${a.border} ${a.bgSoft}`
          : "border-white/10";

  return (
    <Link
      to={`/challenges/${pillar}/${stage.id}`}
      aria-current={active ? "step" : undefined}
      className={`group relative block rounded-lg border ${ring} bg-[#0c0c12] p-4 transition-all hover:border-white/30`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border ${a.border} font-display text-sm ${
            state === "done" ? a.text : "text-white"
          }`}
        >
          {state === "done" ? <Check className="w-4 h-4" /> : stage.order}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="font-display text-white text-sm sm:text-base truncate">
              {stage.title}
            </div>
            <span
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] border ${a.border} ${a.text}`}
            >
              {stage.maxPoints}p
            </span>
          </div>
          <div className="mt-1 text-xs text-white/50">{stage.short}</div>
          <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono text-white/40">
            {stage.hasAssistance ? (
              <>
                <Sparkles className={`w-3 h-3 ${a.text}`} /> Auxílio
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" /> Autônomo
              </>
            )}
            {state === "in-progress" && (
              <span className={`ml-2 ${a.text}`}>· em andamento</span>
            )}
            {state === "done" && (
              <span className={`ml-2 ${a.text}`}>· concluída</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
