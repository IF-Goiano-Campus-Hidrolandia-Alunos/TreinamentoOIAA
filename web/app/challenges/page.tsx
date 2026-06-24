import { getAllChallenges, PILLAR_ORDER } from "@/lib/challenges";
import { getStages } from "@/lib/stages";
import { PillarTabs } from "@/components/pillar-tabs";

export const metadata = { title: "Desafios | Desafio de IA" };

export default function ChallengesPage() {
  const challenges = getAllChallenges();
  const stages = PILLAR_ORDER.map((id) => getStages(id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Os Tres Desafios Academicos</h1>
        <p className="mt-2 text-muted-foreground">
          Cada desafio tem 5 partes: teoria, treino com auxilio, treino sem auxilio, preencher lacunas
          e construir a IA do zero. Selecione um pilar para ver a narrativa e as etapas.
        </p>
      </div>
      <PillarTabs challenges={challenges} stages={stages} />
    </div>
  );
}
