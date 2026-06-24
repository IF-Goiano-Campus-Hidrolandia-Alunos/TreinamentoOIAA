import { listTeams } from "@/lib/teams-store";
import { rankTeams } from "@/lib/scoring";
import { TeamForm } from "@/components/team-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Times | Desafio de IA" };

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const teams = rankTeams(await listTeams(), { sortBy: "name", order: "asc" });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Times</h1>
        <p className="mt-2 text-muted-foreground">
          Monte seu time com o nome, os integrantes (recomendado 3) e o tutor. Cada integrante pontua nas
          etapas; a nota do grupo e a media das notas individuais (o tutor nao conta).
        </p>
      </div>

      <TeamForm />

      <div>
        <h2 className="text-xl font-bold">Times cadastrados ({teams.length})</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {teams.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t.name}</CardTitle>
                  <Badge className="text-primary">Nota grupo: {t.groupScore.toFixed(1)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Tutor: {t.tutor}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {t.members.map((m) => (
                    <li key={m.id} className="flex items-center justify-between">
                      <span className="text-foreground">{m.name}</span>
                      <span className="font-mono text-muted-foreground">{m.score.toFixed(1)}</span>
                    </li>
                  ))}
                  {t.members.length === 0 && <li className="text-muted-foreground">Sem integrantes.</li>}
                </ul>
              </CardContent>
            </Card>
          ))}
          {teams.length === 0 && <p className="text-muted-foreground">Nenhum time ainda. Crie o primeiro!</p>}
        </div>
      </div>
    </div>
  );
}
