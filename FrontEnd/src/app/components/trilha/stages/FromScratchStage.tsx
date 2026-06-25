import { Blocks, ExternalLink, Sparkles } from "lucide-react";
import { ACCENT } from "../../../lib/accents";
import { PILLAR_LINKS } from "../../../lib/links";
import { CodeViewer } from "../CodeViewer";
import type { StageMode } from "../../../lib/types";
import type { StageViewProps } from "./types";
import { MetricSubmissionComponent } from "../MetricSubmissionComponent";

const TABS: { id: StageMode; label: string; icon: typeof Blocks }[] = [
  { id: "blocks", label: "Com blocos", icon: Blocks },
  { id: "scratch", label: "Do zero", icon: Sparkles },
];

export function FromScratchStage({
  pillar,
  stage,
  code,
  progress,
  onProgressChange,
}: StageViewProps) {
  const a = ACCENT[pillar];
  const modes = progress.modes ?? {};
  const bothDone = !!modes.blocks && !!modes.scratch;

  function setMode(m: StageMode, value: boolean) {
    onProgressChange({ modes: { ...modes, [m]: value } });
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <section className={`rounded-xl border ${a.border} ${a.bgSoft} p-6`}>
          <div className={`text-xs uppercase tracking-widest font-mono ${a.text}`}>
            Objetivo
          </div>
          <p className="mt-2 text-white/80">{stage.goal}</p>
        </section>

        <ModeView pillar={pillar} stage={stage} code={code} />

        <MetricSubmissionComponent pillar={pillar} stage={stage.id} />
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-5">
          <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
            Requisitos de entrega
          </div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {stage.details.map((d) => (
              <li key={d}><span className={a.text}>▸</span> {d}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-5 space-y-2">
          <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
            Conclusão por modo
          </div>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id, !modes[id])}
              className={`w-full flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-all ${
                modes[id]
                  ? `${a.border} ${a.bgSoft} text-white`
                  : "border-white/10 text-white/70 hover:border-white/20"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Icon className={`w-4 h-4 ${modes[id] ? a.text : "text-white/40"}`} /> {label}
              </span>
              <span className={`text-[10px] font-mono uppercase tracking-widest ${modes[id] ? a.text : "text-white/30"}`}>
                {modes[id] ? "concluído" : "pendente"}
              </span>
            </button>
          ))}
        </div>

        <button
          disabled={!bothDone}
          onClick={() => onProgressChange({ completed: !progress.completed })}
          className={`w-full rounded-md border ${a.border} ${
            progress.completed ? a.bgSoft : "bg-white/[0.02]"
          } px-4 py-3 text-sm text-white transition-all ${
            !bothDone ? "opacity-40 cursor-not-allowed" : "hover:bg-white/5"
          }`}
        >
          {progress.completed
            ? "Etapa concluída ✓"
            : bothDone
              ? "Concluir etapa"
              : "Complete os 2 modos para concluir"}
        </button>
      </aside>
    </div>
  );
}

function ModeView({
  pillar,
  stage,
  code,
}: Pick<StageViewProps, "pillar" | "stage" | "code">) {
  const a = ACCENT[pillar];
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <span
            key={id}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${a.border} ${a.bgSoft} text-xs font-mono uppercase tracking-widest ${a.text}`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </span>
        ))}
      </div>

      <section className={`rounded-xl border ${a.border} bg-[#0c0c12] p-6`}>
        <div className={`text-xs uppercase tracking-widest font-mono ${a.text} mb-3`}>
          Modo: com blocos
        </div>
        <p className="text-sm text-white/70 mb-4">
          Reaproveite os blocos abaixo e una as peças para gerar a solução final.
        </p>
        {code?.blocks.map((b) => (
          <div key={b.id} className="mt-3">
            <CodeViewer block={b} pillar={pillar} />
          </div>
        ))}
      </section>

      <section className={`rounded-xl border ${a.border} bg-[#0c0c12] p-6`}>
        <div className={`text-xs uppercase tracking-widest font-mono ${a.text} mb-3`}>
          Modo: do zero
        </div>
        <p className="text-sm text-white/70">
          Abra um notebook em branco e implemente toda a solução por conta própria,
          seguindo os requisitos de entrega ao lado.
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-6 text-center font-mono text-white/40 text-sm">
          # comece aqui — notebook em branco
        </div>
        <a
          href="#"
          target="_blank"
          rel="noreferrer"
          className={`mt-4 inline-flex items-center gap-2 text-sm ${a.text} hover:underline`}
        >
          <ExternalLink className="w-4 h-4" /> Abrir Colab vazio
        </a>
      </section>
    </div>
  );
}
