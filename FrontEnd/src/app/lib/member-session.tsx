import { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { ReactNode } from "react";
import { useTeams } from "./teams-store";
import type { PillarId, StageId, ScoreEntry } from "./types";
import { QUIZZES } from "./quizzes";

const SESSION_KEY = "ifg-member-session";
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const api = (path: string) => `${API_BASE}${path}`;

export interface MemberSessionData {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  accessCode: string;
}

interface MemberSessionContextValue {
  member: MemberSessionData | null;
  loading: boolean;
  identify: (accessCode: string) => Promise<void>;
  logout: () => void;
  submitStageScore: (
    pillar: PillarId,
    stage: StageId,
    kind: "quiz" | "metric",
    payload: any
  ) => Promise<{ points: number; best: number }>;
}

const MemberSessionContext = createContext<MemberSessionContextValue | null>(null);

export function MemberSessionProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<MemberSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { teams, mode, submitScore, refreshFromApi } = useTeams();

  // Carregar sessao do localStorage ao inicializar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        setMember(JSON.parse(raw) as MemberSessionData);
      }
    } catch (e) {
      console.error("Falha ao carregar sessao do aluno:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const identify = async (accessCode: string) => {
    const codeClean = accessCode.trim().toUpperCase();
    if (!codeClean) {
      throw new Error("Codigo de acesso invalido");
    }

    if (mode === "api") {
      const res = await fetch(api("/api/identify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: codeClean }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Falha ao identificar codigo");
      }

      const data = (await res.json()) as { member: MemberSessionData };
      setMember(data.member);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.member));
      await refreshFromApi();
    } else {
      // Modo local: buscar no array de times seed/local
      let foundMember: any = null;
      let foundTeam: any = null;

      for (const t of teams) {
        const m = t.members.find(
          (x) => x.accessCode?.trim().toUpperCase() === codeClean
        );
        if (m) {
          foundMember = m;
          foundTeam = t;
          break;
        }
      }

      if (!foundMember) {
        throw new Error("Codigo de acesso nao encontrado");
      }

      const sessionData: MemberSessionData = {
        id: foundMember.id,
        name: foundMember.name,
        teamId: foundTeam.id,
        teamName: foundTeam.name,
        accessCode: codeClean,
      };

      setMember(sessionData);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }
  };

  const logout = () => {
    setMember(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const submitStageScore = async (
    pillar: PillarId,
    stage: StageId,
    kind: "quiz" | "metric",
    payload: any
  ): Promise<{ points: number; best: number }> => {
    if (!member) {
      throw new Error("Aluno nao identificado");
    }

    if (mode === "api") {
      const res = await fetch(api("/api/submit"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-member-code": member.accessCode,
        },
        body: JSON.stringify({
          pillar,
          stage,
          kind,
          payload,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Falha ao processar submissao");
      }

      const data = (await res.json()) as { points: number; best: number; scores: ScoreEntry[] };
      await refreshFromApi();
      return { points: data.points, best: data.best };
    } else {
      // Modo local: calcular nota localmente
      const maxPtsMap: Record<StageId, number> = {
        theory: 10,
        guided: 15,
        unguided: 20,
        "fill-blanks": 25,
        "from-scratch": 30,
      };
      const maxPoints = maxPtsMap[stage] || 0;
      let points = 0;

      if (kind === "quiz") {
        const questions = QUIZZES[pillar]?.[stage] || [];
        const answers = payload.answers || [];
        let correct = 0;
        questions.forEach((q, i) => {
          if (answers[i] === q.correctIndex) {
            correct++;
          }
        });
        points = questions.length > 0 ? Math.round(maxPoints * (correct / questions.length)) : 0;
      } else {
        // Métrica local
        const value = Number(payload.value);
        if (!isNaN(value)) {
          let norm = 0;
          if (pillar === "vc") {
            // Acuracia: baseline 0.20, alvo 0.95
            norm = (value - 0.20) / (0.95 - 0.20);
          } else if (pillar === "nlp") {
            // Acuracia: baseline 0.10, alvo 0.90
            norm = (value - 0.10) / (0.90 - 0.10);
          } else if (pillar === "am") {
            // RMSE: baseline 1.50, alvo 0.80 (menor e melhor)
            norm = (1.50 - value) / (1.50 - 0.80);
          }
          norm = Math.max(0, Math.min(1, norm));
          points = Math.round(maxPoints * norm);
        }
      }

      // Encontrar a melhor nota atual no store local
      const currentTeam = teams.find((t) => t.id === member.teamId);
      const currentMemberObj = currentTeam?.members.find((m) => m.id === member.id);
      const scoreObj = currentMemberObj?.scores.find(
        (s) => s.pillar === pillar && s.stage === stage
      );
      const currentBest = scoreObj ? scoreObj.points : 0;
      const best = Math.max(currentBest, points);

      submitScore(member.teamId, {
        memberId: member.id,
        pillar,
        stage,
        points: best,
      });

      return { points, best };
    }
  };

  const value = useMemo(
    () => ({
      member,
      loading,
      identify,
      logout,
      submitStageScore,
    }),
    [member, loading, teams, mode]
  );

  return (
    <MemberSessionContext.Provider value={value}>
      {children}
    </MemberSessionContext.Provider>
  );
}

export function useMemberSession() {
  const ctx = useContext(MemberSessionContext);
  if (!ctx) {
    throw new Error("useMemberSession must be inside MemberSessionProvider");
  }
  return ctx;
}
