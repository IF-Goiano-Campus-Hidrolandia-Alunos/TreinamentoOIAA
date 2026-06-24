import { useCallback, useEffect, useState } from "react";
import type { PillarId, StageId, StageProgress } from "./types";

const STORAGE_KEY = "oiaa-progress";

// TODO: trocar por API quando o endpoint de progresso existir
//   GET  /api/teams/:teamId/progress?memberId=...   -> StageProgress[]
//   PUT  /api/teams/:teamId/progress  body StageProgress

interface ProgressMap {
  [key: string]: StageProgress;
}

function keyOf(pillar: PillarId, stage: StageId) {
  return `${pillar}::${stage}`;
}

function load(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProgressMap;
  } catch {}
  return {};
}

function save(map: ProgressMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function useStageProgress(pillar: PillarId, stage: StageId) {
  const [map, setMap] = useState<ProgressMap>(() => load());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setMap(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const progress: StageProgress = map[keyOf(pillar, stage)] ?? {
    pillar,
    stage,
    completed: false,
  };

  const update = useCallback(
    (next: Partial<StageProgress>) => {
      setMap((prev) => {
        const k = keyOf(pillar, stage);
        const merged: StageProgress = {
          ...(prev[k] ?? { pillar, stage, completed: false }),
          ...next,
          pillar,
          stage,
          updatedAt: new Date().toISOString(),
        };
        const updated = { ...prev, [k]: merged };
        save(updated);
        return updated;
      });
    },
    [pillar, stage]
  );

  return { progress, update };
}

export function usePillarProgress(pillar: PillarId) {
  const [map, setMap] = useState<ProgressMap>(() => load());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setMap(load());
    };
    const interval = setInterval(() => setMap(load()), 800);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  const entries = Object.values(map).filter((p) => p.pillar === pillar);
  const completed = entries.filter((p) => p.completed).length;
  return {
    completed,
    total: 5,
    byStage: (stage: StageId) => map[keyOf(pillar, stage)] ?? null,
  };
}
