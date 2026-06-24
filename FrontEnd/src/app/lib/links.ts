import type { PillarId, StageId } from "./types";

type PillarLinks = {
  colab: string;
  kaggle?: string;
  repo?: string;
};

export const PILLAR_LINKS: Record<PillarId, PillarLinks> = {
  nlp: { colab: "#", kaggle: "#" },
  vc: { colab: "#", kaggle: "#" },
  am: { colab: "#", kaggle: "#" },
};

export function getStageLink(_pillar: PillarId, _stage: StageId): string {
  return "#";
}
