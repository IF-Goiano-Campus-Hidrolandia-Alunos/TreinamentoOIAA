"use client";

import * as React from "react";
import { Lock, Sparkles } from "lucide-react";
import type { Challenge, PillarStages, Stage } from "@/lib/types";
import { ACCENT } from "@/lib/accents";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PillarTabs({
  challenges,
  stages,
}: {
  challenges: Challenge[];
  stages: PillarStages[];
}) {
  const [active, setActive] = React.useState(challenges[0].id);
  const current = challenges.find((c) => c.id === active)!;
  const currentStages = stages.find((s) => s.pillar === active)?.stages ?? [];
  const accent = ACCENT[current.id];

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-2">
        {challenges.map((c) => {
          const a = ACCENT[c.id];
          const isActive = c.id === active;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(c.id)}
              className={cn(
                "rounded-md border px-4 py-2 text-sm font-semibold transition-colors",
                isActive ? cn(a.text, a.border, a.bgSoft) : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c.abbr}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className={cn("mt-6 rounded-lg border bg-card p-6", accent.border)}>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={cn(accent.text, accent.border)}>{current.name}</Badge>
          <span className="text-xs text-muted-foreground">{current.accentLabel}</span>
        </div>

        <h3 className={cn("mt-3 text-2xl font-bold", accent.text)}>{current.challengeTitle}</h3>
        <p className="mt-1 text-muted-foreground">{current.tagline}</p>

        <div className="mt-5 space-y-3 text-sm leading-relaxed text-foreground/90">
          {current.description.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {current.id === "nlp" && (
          <figure className="mt-5 rounded-md border border-dashed border-nlp/50 bg-nlp/5 p-4 font-mono text-sm">
            <figcaption className="mb-2 text-xs uppercase tracking-wide text-nlp">Manuscrito (simulacao)</figcaption>
            <p className="leading-7 text-foreground/80">
              "...e naquele tempo a cidade <span className="rounded bg-nlp/20 px-1 text-nlp">[____]</span> sob a
              luz das <span className="rounded bg-nlp/20 px-1 text-nlp">[______]</span>, enquanto os viajantes
              buscavam o <span className="rounded bg-nlp/20 px-1 text-nlp">[________]</span> perdido nas
              montanhas..."
            </p>
          </figure>
        )}

        {/* As 5 partes do desafio */}
        <h4 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          As 5 partes deste desafio
        </h4>
        <ol className="mt-3 space-y-3">
          {currentStages.map((stage) => (
            <StageCard key={stage.id} stage={stage} accentText={accent.text} accentBorder={accent.border} />
          ))}
        </ol>

        <p className="mt-5 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Dataset:</span> {current.dataset}
        </p>
      </div>
    </div>
  );
}

function StageCard({
  stage,
  accentText,
  accentBorder,
}: {
  stage: Stage;
  accentText: string;
  accentBorder: string;
}) {
  return (
    <li className={cn("rounded-md border bg-background/40 p-4", accentBorder)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={cn("font-semibold", accentText)}>{stage.title}</span>
        <span className="flex items-center gap-2 text-xs">
          <Badge className="text-muted-foreground">{stage.maxPoints} pts</Badge>
          {stage.hasAssistance ? (
            <span className="inline-flex items-center gap-1 text-am">
              <Sparkles className="h-3 w-3" /> com auxilio
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Lock className="h-3 w-3" /> sem auxilio
            </span>
          )}
        </span>
      </div>
      <p className="mt-1 text-sm text-foreground/90">{stage.short}</p>
      <p className="mt-1 text-xs text-muted-foreground">Objetivo: {stage.goal}</p>
      <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
        {stage.details.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
      {stage.modes && (
        <div className="mt-2 flex gap-2">
          <Badge className={cn(accentText, accentBorder)}>modo: com blocos</Badge>
          <Badge className={cn(accentText, accentBorder)}>modo: do zero</Badge>
        </div>
      )}
    </li>
  );
}
