import { listTeams } from "@/lib/teams-store";
import { rankTeams } from "@/lib/scoring";
import { AdminPanel } from "./admin-panel";

export const metadata = { title: "Área do Tutor | Desafio de IA" };

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const teams = rankTeams(await listTeams(), { sortBy: "name", order: "asc" });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Área do Tutor</h1>
        <p className="mt-2 text-muted-foreground">
          Painel restrito para tutores lançarem notas e gerenciarem os times cadastrados.
        </p>
      </div>

      <AdminPanel initialTeams={teams} />
    </div>
  );
}
