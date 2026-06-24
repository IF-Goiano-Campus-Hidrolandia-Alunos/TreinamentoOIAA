import type { PillarId } from "@/lib/types";

// Classes Tailwind LITERAIS por pilar. Precisam ser strings completas para que
// o scanner do Tailwind as inclua no bundle (classes montadas dinamicamente,
// ex.: `text-${id}`, NAO sao detectadas).
export const ACCENT: Record<
  PillarId,
  { text: string; border: string; bg: string; bgSoft: string; ring: string; glow: string }
> = {
  nlp: {
    text: "text-nlp",
    border: "border-nlp",
    bg: "bg-nlp",
    bgSoft: "bg-nlp/10",
    ring: "ring-nlp",
    glow: "shadow-[0_0_24px_-6px_hsl(var(--nlp))]",
  },
  vc: {
    text: "text-vc",
    border: "border-vc",
    bg: "bg-vc",
    bgSoft: "bg-vc/10",
    ring: "ring-vc",
    glow: "shadow-[0_0_24px_-6px_hsl(var(--vc))]",
  },
  am: {
    text: "text-am",
    border: "border-am",
    bg: "bg-am",
    bgSoft: "bg-am/10",
    ring: "ring-am",
    glow: "shadow-[0_0_24px_-6px_hsl(var(--am))]",
  },
};
