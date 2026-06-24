import type { PillarId } from "./types";

export const ACCENT: Record<
  PillarId,
  {
    name: string;
    text: string;
    border: string;
    bg: string;
    bgSoft: string;
    ring: string;
    glow: string;
    hex: string;
    fromTo: string;
  }
> = {
  nlp: {
    name: "Violeta",
    text: "text-violet-400",
    border: "border-violet-500/60",
    bg: "bg-violet-500",
    bgSoft: "bg-violet-500/10",
    ring: "ring-violet-500/50",
    glow: "shadow-[0_0_30px_-5px_rgba(167,139,250,0.6)]",
    hex: "#a78bfa",
    fromTo: "from-violet-500/20 to-fuchsia-500/5",
  },
  vc: {
    name: "Ciano",
    text: "text-cyan-300",
    border: "border-cyan-400/60",
    bg: "bg-cyan-400",
    bgSoft: "bg-cyan-400/10",
    ring: "ring-cyan-400/50",
    glow: "shadow-[0_0_30px_-5px_rgba(103,232,249,0.6)]",
    hex: "#67e8f9",
    fromTo: "from-cyan-400/20 to-blue-500/5",
  },
  am: {
    name: "Verde",
    text: "text-emerald-300",
    border: "border-emerald-400/60",
    bg: "bg-emerald-400",
    bgSoft: "bg-emerald-400/10",
    ring: "ring-emerald-400/50",
    glow: "shadow-[0_0_30px_-5px_rgba(110,231,183,0.6)]",
    hex: "#6ee7b7",
    fromTo: "from-emerald-400/20 to-lime-400/5",
  },
};
