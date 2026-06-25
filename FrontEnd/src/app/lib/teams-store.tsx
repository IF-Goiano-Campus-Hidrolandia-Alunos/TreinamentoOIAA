import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import type {
  PillarId,
  ScoreEntry,
  StageId,
  Team,
  TeamRanked,
  TeamSortKey,
  SortOrder,
} from "./types";
import { rankTeams } from "./scoring";
import { STAGE_MAX_POINTS, STAGE_ORDER } from "./stages";

const STORAGE_KEY = "ifg-desafio-ia-teams-v2";
const TOKEN_KEY = "ifg-admin-token";
export const ADMIN_TOKEN_DEMO = "capivara-2026";

// Base da API (BackEnd). Em producao, defina VITE_API_URL com a URL do BackEnd
// na Vercel (ex.: https://oiaa-backend.vercel.app). Vazio = mesma origem.
// Se a API nao responder, o store cai automaticamente no modo local.
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const api = (path: string) => `${API_BASE}${path}`;

// Modo do store:
//  - "api":   ha backend (Vercel Functions + Neon) -> dados compartilhados/persistentes.
//  - "local": sem backend (ou DB ausente) -> seed + localStorage (modo demo).
export type StoreMode = "loading" | "api" | "local";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function getAdminToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function seed(): Team[] {
  const now = new Date();
  const t = (days: number) =>
    new Date(now.getTime() - days * 86400000).toISOString();

  const mk = (
    name: string,
    tutor: string,
    members: { name: string; scores: ScoreEntry[] }[],
    daysAgo: number
  ): Team => ({
    id: uid("team"),
    name,
    tutor,
    createdAt: t(daysAgo),
    members: members.map((m) => ({
      id: uid("mem"),
      accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      ...m,
    })),
  });

  const full = (pillar: PillarId, partial = false): ScoreEntry[] =>
    STAGE_ORDER.map((stage) => {
      const max = STAGE_MAX_POINTS[stage];
      const factor = partial ? 0.6 : 0.95;
      return { pillar, stage, points: Math.round(max * factor) };
    });

  return [
    mk(
      "Capivaras Quânticas",
      "Prof. Thyago",
      [
        { name: "Ana Beatriz", scores: [...full("nlp"), ...full("vc"), ...full("am")] },
        { name: "Caio Mendes", scores: [...full("nlp"), ...full("vc"), ...full("am", true)] },
        { name: "Luana Reis", scores: [...full("nlp"), ...full("vc", true), ...full("am")] },
      ],
      7
    ),
    mk(
      "Neurônios do Cerrado",
      "Prof. Mariana",
      [
        { name: "Pedro Cardoso", scores: [...full("nlp", true), ...full("vc"), ...full("am")] },
        { name: "Isabela Souza", scores: [...full("nlp"), ...full("vc", true), ...full("am", true)] },
        { name: "Rafael Lima", scores: [...full("nlp", true), ...full("vc", true), ...full("am")] },
      ],
      5
    ),
    mk(
      "GPT do Goiás",
      "Prof. Diego",
      [
        { name: "Marina Pires", scores: [...full("nlp"), ...full("vc"), ...full("am", true)] },
        { name: "Túlio Andrade", scores: [...full("nlp", true), ...full("vc"), ...full("am", true)] },
      ],
      3
    ),
    mk(
      "Pixel Pampa",
      "Prof. Sara",
      [
        { name: "Bruna Castro", scores: [...full("vc"), ...full("am", true)] },
        { name: "Eduardo Vaz", scores: [...full("vc", true)] },
        { name: "Fernanda Reis", scores: [...full("nlp", true), ...full("vc", true)] },
      ],
      2
    ),
  ];
}

interface TeamsContextValue {
  teams: Team[];
  mode: StoreMode;
  ranked: (opts?: { sortBy: TeamSortKey; order: SortOrder }) => TeamRanked[];
  createTeam: (data: { name: string; tutor: string; members: string[] }) => void;
  deleteTeam: (id: string) => void;
  submitScore: (
    teamId: string,
    payload: { memberId: string; pillar: PillarId; stage: StageId; points: number }
  ) => void;
  refreshFromApi: () => Promise<void>;
}

const TeamsContext = createContext<TeamsContextValue | null>(null);

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [mode, setMode] = useState<StoreMode>("loading");

  // Bootstrap: tenta o backend; se indisponivel, cai para o modo local (seed + localStorage).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(api("/api/teams"), { cache: "no-store" });
        if (r.ok) {
          const data = (await r.json()) as { teams?: Team[] };
          // So entra em modo API se a resposta for realmente o JSON esperado
          // (em vite dev sem backend, /api pode devolver HTML/404 -> cai no local).
          if (Array.isArray(data?.teams)) {
            if (!cancelled) {
              setTeams(data.teams);
              setMode("api");
            }
            return;
          }
        }
      } catch {
        /* sem backend -> fallback local */
      }
      if (cancelled) return;
      let local: Team[] | null = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) local = JSON.parse(raw) as Team[];
      } catch {
        /* ignore */
      }
      setTeams(local ?? seed());
      setMode("local");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persistencia local (apenas no modo local).
  useEffect(() => {
    if (mode !== "local") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    } catch {
      /* ignore */
    }
  }, [teams, mode]);

  async function refreshFromApi() {
    try {
      const r = await fetch(api("/api/teams"), { cache: "no-store" });
      if (r.ok) {
        const d = (await r.json()) as { teams: Team[] };
        setTeams(d.teams ?? []);
      }
    } catch {
      /* ignore */
    }
  }

  const value = useMemo<TeamsContextValue>(
    () => ({
      teams,
      mode,
      ranked: (opts) => rankTeams(teams, opts ?? { sortBy: "groupScore", order: "desc" }),

      createTeam: ({ name, tutor, members }) => {
        const cleaned = members.map((n) => n.trim()).filter(Boolean);
        if (mode === "api") {
          void (async () => {
            try {
              const r = await fetch(api("/api/teams"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), tutor: tutor.trim(), members: cleaned }),
              });
              if (!r.ok) throw new Error("create-failed");
              await refreshFromApi();
            } catch {
              toast.error("Falha ao criar o time no servidor.");
            }
          })();
          return;
        }
        const team: Team = {
          id: uid("team"),
          name: name.trim(),
          tutor: tutor.trim(),
          createdAt: new Date().toISOString(),
          members: cleaned.map((n) => ({ id: uid("mem"), name: n, scores: [] })),
        };
        setTeams((prev) => [team, ...prev]);
      },

      deleteTeam: (id) => {
        if (mode === "api") {
          void (async () => {
            try {
              const r = await fetch(api(`/api/teams?id=${encodeURIComponent(id)}`), {
                method: "DELETE",
                headers: { "x-admin-token": getAdminToken() },
              });
              if (!r.ok) throw new Error("delete-failed");
              await refreshFromApi();
            } catch {
              toast.error("Falha ao excluir o time (verifique o token de admin).");
            }
          })();
          return;
        }
        setTeams((prev) => prev.filter((t) => t.id !== id));
      },

      submitScore: (teamId, { memberId, pillar, stage, points }) => {
        if (mode === "api") {
          void (async () => {
            try {
              const r = await fetch(api("/api/scores"), {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
                body: JSON.stringify({ teamId, memberId, pillar, stage, points }),
              });
              if (!r.ok) throw new Error("score-failed");
              await refreshFromApi();
            } catch {
              toast.error("Falha ao lançar a nota (verifique o token de admin).");
            }
          })();
          return;
        }
        setTeams((prev) =>
          prev.map((t) => {
            if (t.id !== teamId) return t;
            return {
              ...t,
              members: t.members.map((m) => {
                if (m.id !== memberId) return m;
                const others = m.scores.filter(
                  (s) => !(s.pillar === pillar && s.stage === stage)
                );
                return { ...m, scores: [...others, { pillar, stage, points }] };
              }),
            };
          })
        );
      },
      refreshFromApi,
    }),
    [teams, mode, refreshFromApi]
  );

  return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>;
}

export function useTeams() {
  const ctx = useContext(TeamsContext);
  if (!ctx) throw new Error("useTeams must be inside TeamsProvider");
  return ctx;
}
