import { Trophy } from "lucide-react";
import { LeaderboardTable } from "../components/leaderboard/LeaderboardTable";

export function LeaderboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 font-mono">
        <Trophy className="w-3.5 h-3.5" /> Placar · Fase 3
      </div>
      <h1 className="font-display text-4xl text-white mt-2">Leaderboard</h1>
      <p className="mt-3 text-white/60 max-w-2xl">
        Clique nos cabeçalhos para ordenar. Use a busca para filtrar por time,
        tutor ou integrante. Expanda cada linha para ver as notas individuais.
      </p>

      <div className="mt-8">
        <LeaderboardTable />
      </div>
    </div>
  );
}
