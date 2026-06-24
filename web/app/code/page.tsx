import { PILLAR_ORDER } from "@/lib/challenges";
import { getCode } from "@/lib/code-snippets";
import { CodeTabs } from "@/components/code-tabs";

export const metadata = { title: "Estrutura de Codigo | Desafio de IA" };

export default function CodePage() {
  const codes = PILLAR_ORDER.map((id) => getCode(id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estrutura de Codigo — 2a Fase</h1>
        <p className="mt-2 text-muted-foreground">
          O primeiro bloco de cada pilar e o bloco real de importacao de bibliotecas. Em seguida vem o
          esqueleto do algoritmo, com as lacunas marcadas por{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">{"# [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]"}</code>.
        </p>
      </div>
      <CodeTabs codes={codes} />
    </div>
  );
}
