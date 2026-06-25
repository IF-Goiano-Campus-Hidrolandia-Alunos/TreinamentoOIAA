import type { PillarId, StageId } from "./types";

export interface PillarGradingConfig {
  metricName: string;
  lowerIsBetter: boolean;
  baseline: number;
  target: number;
}

export const GRADING_CONFIGS: Record<PillarId, PillarGradingConfig> = {
  vc: {
    metricName: "Acuracia",
    lowerIsBetter: false,
    baseline: 0.20,
    target: 0.95,
  },
  am: {
    metricName: "RMSE",
    lowerIsBetter: true,
    baseline: 1.50,
    target: 0.80,
  },
  nlp: {
    metricName: "Acuracia",
    lowerIsBetter: false,
    baseline: 0.10,
    target: 0.90,
  },
};

export const STAGE_MAX_POINTS: Record<StageId, number> = {
  theory: 10,
  guided: 15,
  unguided: 20,
  "fill-blanks": 25,
  "from-scratch": 30,
};

export function calculateMetricPoints(pillar: PillarId, stage: StageId, value: number): number {
  const config = GRADING_CONFIGS[pillar];
  if (!config) return 0;

  const maxPoints = STAGE_MAX_POINTS[stage] || 0;
  let norm = 0;

  if (config.lowerIsBetter) {
    // Para RMSE: se o valor for maior que a baseline, norm e 0. Se for menor que o alvo, norm e 1.
    if (value >= config.baseline) {
      norm = 0;
    } else if (value <= config.target) {
      norm = 1;
    } else {
      norm = (config.baseline - value) / (config.baseline - config.target);
    }
  } else {
    // Para Acuracia: se o valor for menor que a baseline, norm e 0. Se for maior que o alvo, norm e 1.
    if (value <= config.baseline) {
      norm = 0;
    } else if (value >= config.target) {
      norm = 1;
    } else {
      norm = (value - config.baseline) / (config.target - config.baseline);
    }
  }

  // Garantir limites entre 0 e 1
  norm = Math.max(0, Math.min(1, norm));

  return Math.round(maxPoints * norm);
}
