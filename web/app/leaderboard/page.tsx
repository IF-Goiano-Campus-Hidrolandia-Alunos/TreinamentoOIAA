import { listTeams } from "@/lib/teams-store";
import { rankTeams } from "@/lib/scoring";
import { LeaderboardTable } from "@/components/leaderboard-table";

export const metadata = { title: "Placar | Desafio de IA" };

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const teams = rankTeams(await listTeams(), { sortBy: "groupScore", order: "desc" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Placar de Pontuacao</h1>
        <p className="mt-2 text-muted-foreground">
          A nota do grupo e a <span className="font-semibold text-foreground">media das notas individuais</span>{" "}
          dos integrantes (o tutor nao conta). Clique num time para ver as notas individuais; clique nos
          cabecalhos para ordenar e use a busca para filtrar.
        </p>
      </div>

      <LeaderboardTable initial={teams} />

      <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
        Sistema de pontuacao e gerenciamento desenvolvido por{" "}
        <span className="font-semibold text-foreground">Thyago</span>.
      </p>
    </div>
  );
}
