"use client";

import * as React from "react";
import type { PillarCode, PillarId } from "@/lib/types";
import { ACCENT } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/code-block";

const LABELS: Record<PillarId, string> = { nlp: "NLP", vc: "VC", am: "AM" };

export function CodeTabs({ codes }: { codes: PillarCode[] }) {
  const [active, setActive] = React.useState<PillarId>(codes[0].pillar);
  const current = codes.find((c) => c.pillar === active)!;
  const accent = ACCENT[current.pillar];

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-2">
        {codes.map((c) => {
          const a = ACCENT[c.pillar];
          const isActive = c.pillar === active;
          return (
            <button
              key={c.pillar}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(c.pillar)}
              className={cn(
                "rounded-md border px-4 py-2 text-sm font-semibold transition-colors",
                isActive ? cn(a.text, a.border, a.bgSoft) : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {LABELS[c.pillar]}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-5">
        {current.blocks.map((b) => (
          <div key={b.id}>
            {b.highlight && (
              <p className={cn("mb-2 text-xs font-semibold uppercase tracking-wide", accent.text)}>
                Comece por aqui
              </p>
            )}
            <CodeBlock title={b.title} language={b.language} code={b.code} />
          </div>
        ))}
      </div>
    </div>
  );
}
