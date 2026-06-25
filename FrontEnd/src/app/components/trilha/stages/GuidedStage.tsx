import { useState } from "react";
import { ExternalLink, Lightbulb, ListChecks } from "lucide-react";
import { ACCENT } from "../../../lib/accents";
import { PILLAR_LINKS } from "../../../lib/links";
import type { StageViewProps } from "./types";
import { QuizComponent } from "../QuizComponent";

export function GuidedStage({
  pillar,
  challenge,
  stage,
  progress,
  onProgressChange,
}: StageViewProps) {
  const a = ACCENT[pillar];
  const [tipsOpen, setTipsOpen] = useState(true);

  const checklist = progress.checklist ?? {};
  const totalSteps = challenge.steps.length;
  const doneSteps = challenge.steps.filter((s) => checklist[s]).length;

  function toggle(stepKey: string) {
    onProgressChange({
      checklist: { ...checklist, [stepKey]: !checklist[stepKey] },
    });
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <section className={`rounded-xl border ${a.border} ${a.bgSoft} p-6`}>
          <div className={`text-xs uppercase tracking-widest font-mono ${a.text}`}>
            Objetivo
          </div>
          <p className="mt-2 text-white/80 leading-relaxed">{stage.goal}</p>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#0c0c12] p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 font-mono">
            <ListChecks className="w-3.5 h-3.5" /> Checklist do pipeline
            <span className="ml-auto text-white/40">
              {doneSteps}/{totalSteps}
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {challenge.steps.map((s) => {
              const checked = !!checklist[s];
              return (
                <li key={s}>
                  <label
                    className={`flex items-start gap-3 rounded-md border px-3 py-2 cursor-pointer transition-all ${
                      checked
                        ? `${a.border} ${a.bgSoft}`
                        : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(s)}
                      className="mt-1 accent-violet-400"
                    />
                    <span
                      className={`text-sm ${
                        checked ? "text-white" : "text-white/70"
                      }`}
                    >
                      {s}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <QuizComponent pillar={pillar} stage={stage.id} />
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-[#0c0c12] overflow-hidden">
          <button
            onClick={() => setTipsOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-5 py-4 text-left"
          >
            <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 font-mono">
              <Lightbulb className={`w-3.5 h-3.5 ${a.text}`} /> Dicas reveladas
            </span>
            <span className="text-white/40 text-xs">{tipsOpen ? "−" : "+"}</span>
          </button>
          {tipsOpen && (
            <div className="px-5 pb-5 space-y-2">
              {stage.details.map((d) => (
                <div
                  key={d}
                  className={`rounded-md border ${a.border} ${a.bgSoft} px-3 py-2 text-sm text-white/80`}
                >
                  <span className={a.text}>▸</span> {d}
                </div>
              ))}
            </div>
          )}
        </div>

        <a
          href={PILLAR_LINKS[pillar].colab}
          target="_blank"
          rel="noreferrer"
          className="block rounded-md border border-white/10 px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white inline-flex items-center gap-2 w-full justify-center"
        >
          <ExternalLink className="w-4 h-4" /> Abrir notebook do pilar
        </a>

        <button
          onClick={() => onProgressChange({ completed: !progress.completed })}
          className={`w-full rounded-md border ${a.border} ${
            progress.completed ? a.bgSoft : "bg-white/[0.02]"
          } px-4 py-3 text-sm text-white hover:bg-white/5 transition-all`}
        >
          {progress.completed ? "Treino guiado concluído ✓" : "Concluir treino guiado"}
        </button>
      </aside>
    </div>
  );
}
