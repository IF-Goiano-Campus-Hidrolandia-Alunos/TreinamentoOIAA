import { GraduationCap, Trophy } from "lucide-react";
import type { TeamRanked } from "../../lib/types";

export function TeamCard({ team }: { team: TeamRanked }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-6 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="font-display text-xl text-white">{team.name}</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-white/50">
            <GraduationCap className="w-4 h-4" /> {team.tutor}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
            Nota do grupo
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Trophy className="w-4 h-4 text-violet-300" />
            <span className="font-display text-2xl text-white">{team.groupScore.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {team.members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2"
          >
            <div className="min-w-0">
              <div className="text-sm text-white truncate">{m.name}</div>
              <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
                {m.stagesCompleted}/15 etapas
              </div>
            </div>
            <div className="font-mono text-sm text-violet-300">
              {m.individualScore.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
