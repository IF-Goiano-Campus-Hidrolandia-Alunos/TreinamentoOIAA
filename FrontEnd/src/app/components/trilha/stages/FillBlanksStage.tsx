import { useMemo } from "react";
import { Code2 } from "lucide-react";
import { ACCENT } from "../../../lib/accents";
import { countPlaceholders } from "../../../lib/code-snippets";
import { CodeViewer } from "../CodeViewer";
import type { StageViewProps } from "./types";

export function FillBlanksStage({
  pillar,
  stage,
  code,
  progress,
  onProgressChange,
}: StageViewProps) {
  const a = ACCENT[pillar];

  const totalBlanks = useMemo(() => {
    if (!code) return 0;
    return code.blocks.reduce((sum, b) => sum + countPlaceholders(b.code), 0);
  }, [code]);

  if (!code) return null;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <section className={`rounded-xl border ${a.border} ${a.bgSoft} p-6`}>
          <div className={`text-xs uppercase tracking-widest font-mono ${a.text}`}>
            Objetivo
          </div>
          <p className="mt-2 text-white/80">{stage.goal}</p>
          <p className="mt-3 text-sm text-white/60">
            <span className={a.text}>{totalBlanks}</span> {totalBlanks === 1 ? "lacuna" : "lacunas"} para
            preencher ao longo de {code.blocks.length - 1}{" "}
            {code.blocks.length - 1 === 1 ? "bloco" : "blocos"} (sem contar o import).
          </p>
        </section>

        {code.blocks.map((b) => (
          <CodeViewer key={b.id} block={b} pillar={pillar} />
        ))}
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 font-mono">
            <Code2 className={`w-3.5 h-3.5 ${a.text}`} /> Como entregar
          </div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {stage.details.map((d) => (
              <li key={d}><span className={a.text}>▸</span> {d}</li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => onProgressChange({ completed: !progress.completed })}
          className={`w-full rounded-md border ${a.border} ${
            progress.completed ? a.bgSoft : "bg-white/[0.02]"
          } px-4 py-3 text-sm text-white hover:bg-white/5 transition-all`}
        >
          {progress.completed ? "Etapa concluída ✓" : "Marcar etapa como concluída"}
        </button>
      </aside>
    </div>
  );
}
