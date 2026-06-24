import { useState } from "react";
import { motion } from "motion/react";
import { ACCENT } from "../lib/accents";
import { PILLARS } from "../lib/challenges";
import { PILLAR_ORDER } from "../lib/stages";
import { getCode } from "../lib/code-snippets";
import type { PillarId } from "../lib/types";
import { CodeBlockView } from "../components/code/CodeBlockView";
import { Terminal } from "lucide-react";

export function CodePage() {
  const [tab, setTab] = useState<PillarId>("nlp");
  const code = getCode(tab);
  const a = ACCENT[tab];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 font-mono">
        <Terminal className="w-3.5 h-3.5" /> Estrutura · Fase 2
      </div>
      <h1 className="font-display text-4xl text-white mt-2">Código-Bruto</h1>
      <p className="mt-3 text-white/60 max-w-2xl">
        Esqueletos em Python para cada pilar. Os trechos destacados em vermelho
        marcam onde a sua equipe precisa implementar a lógica.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {PILLAR_ORDER.map((id) => {
          const acc = ACCENT[id];
          const active = id === tab;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                "px-4 py-2 rounded-md text-sm font-mono uppercase tracking-widest border transition-all",
                active
                  ? `${acc.text} ${acc.border} ${acc.bgSoft} ${acc.glow}`
                  : "text-white/50 border-white/10 hover:text-white hover:border-white/20",
              ].join(" ")}
            >
              {PILLARS[id].shortName}
            </button>
          );
        })}
      </div>

      <div className={`mt-6 inline-flex items-center gap-2 text-xs ${a.text} font-mono`}>
        <span className="w-2 h-2 rounded-full bg-current" />
        {code.blocks.length} blocos · {code.blocks.filter((b) => b.hasPlaceholder).length} com
        lacunas
      </div>

      <div className="mt-6 space-y-5">
        {code.blocks.map((b, i) => (
          <motion.div
            key={`${tab}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <CodeBlockView block={b} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
