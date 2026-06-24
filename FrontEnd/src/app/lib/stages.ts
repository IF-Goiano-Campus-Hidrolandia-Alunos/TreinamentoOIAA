import type { PillarId, Stage, StageId, PillarStages } from "./types";

export const STAGE_MAX_POINTS: Record<StageId, number> = {
  theory: 10,
  guided: 15,
  unguided: 20,
  "fill-blanks": 25,
  "from-scratch": 30,
};

export const STAGE_ORDER: StageId[] = [
  "theory",
  "guided",
  "unguided",
  "fill-blanks",
  "from-scratch",
];

export const POINTS_PER_PILLAR = 100;
export const MAX_POINTS_TOTAL = 300;
export const TOTAL_STAGES = 15;

export const STAGES: Stage[] = [
  {
    id: "theory",
    order: 1,
    title: "1. Teoria",
    short: "Fundamentos e contexto histórico.",
    goal: "Compreender o problema e os conceitos centrais antes de praticar.",
    hasAssistance: true,
    maxPoints: 10,
    details: [
      "Ler a narrativa do desafio e identificar o problema.",
      "Estudar os conceitos-chave e a estrutura do dataset.",
      "Produzir um resumo curto com suas próprias palavras.",
    ],
  },
  {
    id: "guided",
    order: 2,
    title: "2. Treino com auxílio",
    short: "Pipeline guiado com dicas em cada passo.",
    goal: "Reproduzir o pipeline acompanhando dicas e gabaritos parciais.",
    hasAssistance: true,
    maxPoints: 15,
    details: [
      "Seguir o pipeline passo a passo com as dicas reveladas.",
      "Executar cada célula e observar as métricas intermediárias.",
      "Anotar dúvidas e bloqueios para a próxima etapa.",
    ],
  },
  {
    id: "unguided",
    order: 3,
    title: "3. Treino sem auxílio",
    short: "Repetir o pipeline sem dicas.",
    goal: "Reconstruir o pipeline de forma autônoma, justificando escolhas.",
    hasAssistance: false,
    maxPoints: 20,
    details: [
      "Recriar o pipeline do zero, sem consultar as dicas.",
      "Justificar a escolha de cada hiperparâmetro.",
      "Comparar suas métricas com as obtidas na etapa anterior.",
    ],
  },
  {
    id: "fill-blanks",
    order: 4,
    title: "4. Preencher lacunas",
    short: "Completar o código marcado com [PASSO EM BRANCO].",
    goal: "Implementar os trechos faltantes do esqueleto fornecido.",
    hasAssistance: false,
    maxPoints: 25,
    details: [
      "Abrir o esqueleto e identificar todas as ocorrências do marcador.",
      "Implementar cada lacuna respeitando os tipos de entrada/saída.",
      "Validar que o código completo executa de ponta a ponta.",
    ],
  },
  {
    id: "from-scratch",
    order: 5,
    title: "5. IA do zero",
    short: "Construir a solução final em dois modos.",
    goal: "Entregar uma solução completa, primeiro com blocos prontos e depois do zero.",
    hasAssistance: false,
    maxPoints: 30,
    details: [
      "Modo 'com blocos': montar a solução a partir de componentes prontos.",
      "Modo 'do zero': escrever todo o pipeline em um notebook vazio.",
      "Documentar as decisões de projeto e medir os resultados finais.",
    ],
    modes: ["blocks", "scratch"],
  },
];

const STAGES_BY_PILLAR: PillarStages[] = (["nlp", "vc", "am"] as PillarId[]).map(
  (pillar) => ({ pillar, stages: STAGES })
);

export function getStages(pillar: PillarId): PillarStages {
  return STAGES_BY_PILLAR.find((s) => s.pillar === pillar) ?? { pillar, stages: STAGES };
}

export function getStage(stageId: StageId): Stage {
  return STAGES.find((s) => s.id === stageId)!;
}

export const PILLAR_ORDER: PillarId[] = ["nlp", "vc", "am"];
