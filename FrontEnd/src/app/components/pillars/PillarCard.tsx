import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { ACCENT } from "../../lib/accents";
import type { Pillar } from "../../lib/types";

export function PillarCard({ pillar }: { pillar: Pillar }) {
  const a = ACCENT[pillar.id];
  return (
    <Link
      to="/challenges"
      className={`group relative block rounded-xl border ${a.border} bg-gradient-to-br ${a.fromTo} p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:${a.glow}`}
    >
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="relative flex flex-col h-full">
        <div className={`text-xs font-mono uppercase tracking-widest ${a.text}`}>
          Pilar · {pillar.shortName}
        </div>
        <div className="mt-3 font-display text-white text-2xl leading-tight">
          {pillar.name}
        </div>
        <p className="mt-4 text-sm text-white/60 flex-1">{pillar.tagline}</p>
        <div className={`mt-6 flex items-center gap-2 text-sm ${a.text}`}>
          Explorar pilar
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
