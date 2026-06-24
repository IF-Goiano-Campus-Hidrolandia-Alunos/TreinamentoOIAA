import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import seed from "@/data/teams.json";
import type { Member, ScoreEntry, Team } from "@/lib/types";
import type { CreateTeamInput, SubmitScoreInput } from "@/lib/validation";

const globalForStore = globalThis as unknown as { __teams?: Team[] };

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
let isDbInitialized = false;

async function initDb() {
  if (!sql || isDbInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tutor TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        scores JSONB NOT NULL DEFAULT '[]'::jsonb
      );
    `;
    isDbInitialized = true;
  } catch (err) {
    console.error("Erro ao inicializar tabelas no Neon Postgres:", err);
  }
}

function saveLocal(teams: Team[]) {
  try {
    const filePath = path.join(process.cwd(), "data", "teams.json");
    fs.writeFileSync(filePath, JSON.stringify(teams, null, 2), "utf-8");
  } catch (err) {
    console.warn("Nao foi possivel persistir localmente no disco (modo de producao ou Vercel):", err);
  }
}

function loadLocal(): Team[] {
  if (!globalForStore.__teams) {
    globalForStore.__teams = (seed as Team[]).map((t) => ({
      ...t,
      members: t.members.map((m) => ({ ...m, scores: m.scores.map((s) => ({ ...s })) })),
    }));
  }
  return globalForStore.__teams;
}

function rand(): string {
  return Math.random().toString(36).slice(2, 8);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function listTeams(): Promise<Team[]> {
  if (sql) {
    await initDb();
    try {
      const dbTeams = await sql`SELECT * FROM teams ORDER BY created_at ASC`;
      const dbMembers = await sql`SELECT * FROM members`;
      
      const teamsMap = new Map<string, Team>();
      for (const t of dbTeams) {
        teamsMap.set(t.id, {
          id: t.id,
          name: t.name,
          tutor: t.tutor,
          createdAt: t.created_at,
          members: []
        });
      }
      
      for (const m of dbMembers) {
        const team = teamsMap.get(m.team_id);
        if (team) {
          team.members.push({
            id: m.id,
            name: m.name,
            scores: typeof m.scores === "string" ? JSON.parse(m.scores) : (m.scores as ScoreEntry[])
          });
        }
      }
      
      return Array.from(teamsMap.values());
    } catch (err) {
      console.error("Erro ao listar times do Neon Postgres, usando local:", err);
    }
  }
  return loadLocal();
}

export async function getTeam(id: string): Promise<Team | undefined> {
  const teams = await listTeams();
  return teams.find((t) => t.id === id);
}

export async function createTeam(input: CreateTeamInput, nowISO: string): Promise<Team> {
  const teams = await listTeams();
  const baseId = `time-${slugify(input.name) || "sem-nome"}`;
  const id = teams.some((t) => t.id === baseId) ? `${baseId}-${rand()}` : baseId;

  const membersData = input.members.map((name) => ({
    id: `${slugify(name) || "membro"}-${rand()}`,
    name,
    scores: [] as ScoreEntry[]
  }));

  if (sql) {
    await initDb();
    try {
      await sql`
        INSERT INTO teams (id, name, tutor, created_at)
        VALUES (${id}, ${input.name}, ${input.tutor}, ${nowISO})
      `;
      for (const m of membersData) {
        await sql`
          INSERT INTO members (id, team_id, name, scores)
          VALUES (${m.id}, ${id}, ${m.name}, ${JSON.stringify(m.scores)})
        `;
      }
      return {
        id,
        name: input.name,
        tutor: input.tutor,
        members: membersData,
        createdAt: nowISO
      };
    } catch (err) {
      console.error("Erro ao criar time no Neon Postgres, salvando local:", err);
    }
  }

  // Fallback local
  const store = loadLocal();
  const team: Team = {
    id,
    name: input.name,
    tutor: input.tutor,
    members: membersData,
    createdAt: nowISO,
  };
  store.push(team);
  saveLocal(store);
  return team;
}

export async function deleteTeam(id: string): Promise<boolean> {
  if (sql) {
    await initDb();
    try {
      const team = await getTeam(id);
      if (!team) return false;
      await sql`DELETE FROM teams WHERE id = ${id}`;
      return true;
    } catch (err) {
      console.error("Erro ao deletar time no Neon Postgres:", err);
    }
  }

  const store = loadLocal();
  const idx = store.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  saveLocal(store);
  return true;
}

export type SubmitResult =
  | { ok: true; team: Team }
  | { ok: false; reason: "team-not-found" | "member-not-found" };

export async function submitScore(teamId: string, input: SubmitScoreInput): Promise<SubmitResult> {
  if (sql) {
    await initDb();
    try {
      const rows = await sql`SELECT scores FROM members WHERE id = ${input.memberId} AND team_id = ${teamId}`;
      if (rows.length === 0) return { ok: false, reason: "member-not-found" };
      
      const scores: ScoreEntry[] = typeof rows[0].scores === "string" ? JSON.parse(rows[0].scores) : (rows[0].scores as ScoreEntry[]);
      const existing = scores.find((s) => s.pillar === input.pillar && s.stage === input.stage);
      if (existing) {
        existing.points = input.points;
      } else {
        scores.push({ pillar: input.pillar, stage: input.stage, points: input.points });
      }
      
      await sql`UPDATE members SET scores = ${JSON.stringify(scores)} WHERE id = ${input.memberId}`;
      const team = await getTeam(teamId);
      if (!team) return { ok: false, reason: "team-not-found" };
      return { ok: true, team };
    } catch (err) {
      console.error("Erro ao lancar nota no Neon Postgres:", err);
    }
  }

  // Fallback local
  const team = await getTeam(teamId);
  if (!team) return { ok: false, reason: "team-not-found" };

  const member = team.members.find((m) => m.id === input.memberId);
  if (!member) return { ok: false, reason: "member-not-found" };

  const entry: ScoreEntry = { pillar: input.pillar, stage: input.stage, points: input.points };
  const existing = member.scores.find(
    (s) => s.pillar === input.pillar && s.stage === input.stage,
  );
  if (existing) existing.points = input.points;
  else member.scores.push(entry);

  saveLocal(loadLocal());
  return { ok: true, team };
}
