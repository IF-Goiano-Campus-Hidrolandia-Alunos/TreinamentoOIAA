import { Link } from "react-router";
import { Lock, Sparkles } from "lucide-react";
import { ACCENT } from "../../lib/accents";
import type { PillarId, Stage } from "../../lib/types";

export function StageStepper({
  stages,
  pillar,
}: {
  stages: Stage[];
  pillar: PillarId;
}) {
  const a = ACCENT[pillar];
  return (
    <ol className="relative space-y-3">
      {stages.map((s, i) => (
        <li
          key={s.id}
          className={`relative rounded-lg border ${a.border} ${a.bgSoft} p-4 transition-all hover:bg-white/5`}
        >
          <Link to={`/challenges/${pillar}/${s.id}`} className="block">
            <div className="flex items-start gap-4">
              <div
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${a.border} font-display text-sm ${a.text}`}
              >
                {s.order}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="font-display text-white text-lg">{s.title}</div>
                  <div className="flex items-center gap-2">
                    {s.hasAssistance ? (
                      <span className={`text-[10px] uppercase tracking-widest font-mono ${a.text} inline-flex items-center gap-1`}>
                        <Sparkles className="w-3 h-3" />
                        Com auxílio
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Sem auxílio
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-xs border ${a.border} ${a.text}`}
                    >
                      {s.maxPoints} pts
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-white/60">{s.short}</p>
                <p className="mt-2 text-xs text-white/40">{s.goal}</p>
                {s.modes && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {s.modes.map((m) => (
                      <span
                        key={m}
                        className={`text-[11px] px-2 py-0.5 rounded-full font-mono border ${a.border} ${a.text}`}
                      >
                        Modo: {m === "blocks" ? "com blocos" : "do zero"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
          {i < stages.length - 1 && (
            <div
              className={`absolute left-[35px] -bottom-3 w-px h-3 ${a.bg} opacity-40`}
            />
          )}
        </li>
      ))}
    </ol>
  );
}
