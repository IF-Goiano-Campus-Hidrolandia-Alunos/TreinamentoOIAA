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

// ---- metricas a partir de previsoes vs gabarito (CSV auto-scorer) ----

/** Acuracia: fracao de ids cujo rotulo previsto bate com o gabarito (0..1). */
export function computeAccuracy(
  predMap: Record<string, string>,
  keyMap: Record<string, string | number>,
): number {
  const ids = Object.keys(keyMap);
  if (ids.length === 0) return 0;
  let correct = 0;
  for (const id of ids) {
    const truth = String(keyMap[id]).trim();
    const pred = (predMap[id] ?? "").trim();
    if (pred !== "" && pred === truth) correct++;
  }
  return correct / ids.length;
}

/** RMSE entre previsao e gabarito numericos (ausente/invalido conta como erro). */
export function computeRmse(
  predMap: Record<string, string>,
  keyMap: Record<string, string | number>,
): number {
  const ids = Object.keys(keyMap);
  if (ids.length === 0) return Number.POSITIVE_INFINITY;
  let sumSq = 0;
  for (const id of ids) {
    const truth = Number(keyMap[id]);
    const predRaw = predMap[id];
    const pred = predRaw === undefined || predRaw === "" ? NaN : Number(predRaw);
    const p = Number.isFinite(pred) ? pred : 0; // ausencia/invalido = 0 -> penaliza
    const diff = p - (Number.isFinite(truth) ? truth : 0);
    sumSq += diff * diff;
  }
  return Math.sqrt(sumSq / ids.length);
}
