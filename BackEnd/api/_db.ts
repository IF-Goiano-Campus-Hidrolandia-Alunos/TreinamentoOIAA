import { neon } from "@neondatabase/serverless";
import type { Member, ScoreEntry, Team } from "../lib/types";

// Acesso ao Neon Postgres + helpers de CORS para as Vercel Functions do BackEnd.
// Retorna sempre Team[] "cru" (id, name, tutor, members[{id,name,scores[]}], createdAt);
// o ranking/scoring e feito no FrontEnd.

const STAGE_MAX: Record<string, number> = {
  theory: 10,
  guided: 15,
  unguided: 20,
  "fill-blanks": 25,
  "from-scratch": 30,
};
const PILLARS = new Set(["nlp", "vc", "am"]);
const STAGES = new Set(["theory", "guided", "unguided", "fill-blanks", "from-scratch"]);

type Sql = ReturnType<typeof neon>;

// ---- CORS (permite o FrontEnd, em outro dominio, chamar a API) ----

export function applyCors(res: { setHeader: (k: string, v: string) => void }) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, x-admin-token, x-member-code, x-access-code",
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

// ---- conexao / auth ----

export function getSql(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export function isAdmin(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const token = req.headers["x-admin-token"];
  return typeof token === "string" && token === expected;
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

let schemaReady = false;
export async function ensureSchema(sql: Sql) {
  if (schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tutor TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      scores JSONB NOT NULL DEFAULT '[]'::jsonb,
      access_code TEXT
    )
  `;
  try {
    await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS access_code TEXT`;
  } catch (e) {}
  try {
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS members_access_code_idx ON members(access_code)`;
  } catch (e) {}

  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      pillar TEXT NOT NULL,
      stage TEXT NOT NULL,
      points INTEGER NOT NULL,
      detail JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TEXT NOT NULL
    )
  `;
  // Gabaritos (answer keys) cadastrados pelo tutor para auto-correcao por CSV.
  // keys = { "<id da linha>": <label|valor verdadeiro> }; metric = 'accuracy' | 'rmse'.
  await sql`
    CREATE TABLE IF NOT EXISTS answer_keys (
      pillar TEXT NOT NULL,
      stage TEXT NOT NULL,
      metric TEXT NOT NULL,
      keys JSONB NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (pillar, stage)
    )
  `;
  schemaReady = true;
}

function parseScores(raw: unknown): ScoreEntry[] {
  if (Array.isArray(raw)) return raw as ScoreEntry[];
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as ScoreEntry[];
    } catch {
      return [];
    }
  }
  return [];
}

export async function listTeams(sql: Sql): Promise<Team[]> {
  await ensureSchema(sql);
  const teamRows = (await sql`SELECT * FROM teams ORDER BY created_at DESC`) as Record<string, any>[];
  const memberRows = (await sql`SELECT * FROM members`) as Record<string, any>[];
  const map = new Map<string, Team>();
  for (const t of teamRows) {
    map.set(t.id, { id: t.id, name: t.name, tutor: t.tutor, createdAt: t.created_at, members: [] });
  }
  for (const m of memberRows) {
    const team = map.get(m.team_id);
    if (team) {
      team.members.push({
        id: m.id,
        name: m.name,
        scores: parseScores(m.scores),
        accessCode: m.access_code || undefined,
      });
    }
  }
  return [...map.values()];
}

export async function createTeam(
  sql: Sql,
  input: { name: string; tutor: string; members: string[] }
): Promise<Team> {
  await ensureSchema(sql);
  const id = uid("team");
  const createdAt = new Date().toISOString();
  await sql`INSERT INTO teams (id, name, tutor, created_at) VALUES (${id}, ${input.name}, ${input.tutor}, ${createdAt})`;
  const members: Member[] = [];
  for (const name of input.members) {
    const mid = uid("mem");
    const code = generateAccessCode();
    await sql`INSERT INTO members (id, team_id, name, scores, access_code) VALUES (${mid}, ${id}, ${name}, '[]'::jsonb, ${code})`;
    members.push({ id: mid, name, scores: [], accessCode: code });
  }
  return { id, name: input.name, tutor: input.tutor, createdAt, members };
}

export async function deleteTeam(sql: Sql, id: string): Promise<boolean> {
  await ensureSchema(sql);
  const rows = (await sql`DELETE FROM teams WHERE id = ${id} RETURNING id`) as Record<string, any>[];
  return rows.length > 0;
}

export async function submitScore(
  sql: Sql,
  p: { teamId: string; memberId: string; pillar: string; stage: string; points: number }
): Promise<boolean> {
  await ensureSchema(sql);
  const rows = (await sql`SELECT scores FROM members WHERE id = ${p.memberId} AND team_id = ${p.teamId}`) as Record<string, any>[];
  if (rows.length === 0) return false;
  const scores = parseScores(rows[0].scores).filter(
    (s) => !(s.pillar === p.pillar && s.stage === p.stage)
  );
  scores.push({ pillar: p.pillar as ScoreEntry["pillar"], stage: p.stage as ScoreEntry["stage"], points: p.points });
  await sql`UPDATE members SET scores = ${JSON.stringify(scores)}::jsonb WHERE id = ${p.memberId}`;
  return true;
}

// ---- gabaritos (answer keys) ----

export async function getAnswerKey(
  sql: Sql,
  pillar: string,
  stage: string,
): Promise<{ metric: string; keys: Record<string, string | number> } | null> {
  await ensureSchema(sql);
  const rows = (await sql`SELECT metric, keys FROM answer_keys WHERE pillar = ${pillar} AND stage = ${stage} LIMIT 1`) as Record<string, any>[];
  if (rows.length === 0) return null;
  const keys = typeof rows[0].keys === "string" ? JSON.parse(rows[0].keys) : rows[0].keys;
  return { metric: rows[0].metric, keys };
}

export async function setAnswerKey(
  sql: Sql,
  pillar: string,
  stage: string,
  metric: string,
  keys: Record<string, string | number>,
): Promise<number> {
  await ensureSchema(sql);
  const updatedAt = new Date().toISOString();
  await sql`
    INSERT INTO answer_keys (pillar, stage, metric, keys, updated_at)
    VALUES (${pillar}, ${stage}, ${metric}, ${JSON.stringify(keys)}::jsonb, ${updatedAt})
    ON CONFLICT (pillar, stage)
    DO UPDATE SET metric = EXCLUDED.metric, keys = EXCLUDED.keys, updated_at = EXCLUDED.updated_at
  `;
  return Object.keys(keys).length;
}

export async function deleteAnswerKey(sql: Sql, pillar: string, stage: string): Promise<boolean> {
  await ensureSchema(sql);
  const rows = (await sql`DELETE FROM answer_keys WHERE pillar = ${pillar} AND stage = ${stage} RETURNING pillar`) as Record<string, any>[];
  return rows.length > 0;
}

// ---- rate limit / tentativas ----

export async function countAttempts(
  sql: Sql,
  memberId: string,
  pillar: string,
  stage: string,
): Promise<number> {
  const rows = (await sql`SELECT COUNT(*)::int AS n FROM submissions WHERE member_id = ${memberId} AND pillar = ${pillar} AND stage = ${stage}`) as Record<string, any>[];
  return rows[0]?.n ?? 0;
}

/** Epoch ms da ultima submissao do integrante (qualquer etapa), ou null. */
export async function lastSubmissionAt(sql: Sql, memberId: string): Promise<number | null> {
  const rows = (await sql`SELECT created_at FROM submissions WHERE member_id = ${memberId} ORDER BY created_at DESC LIMIT 1`) as Record<string, any>[];
  if (rows.length === 0) return null;
  const t = Date.parse(rows[0].created_at);
  return Number.isFinite(t) ? t : null;
}

// ---- validacao leve (sem dependencias externas) ----

export function validateCreate(
  body: any
): { name: string; tutor: string; members: string[] } | null {
  if (!body || typeof body.name !== "string" || typeof body.tutor !== "string") return null;
  if (!Array.isArray(body.members)) return null;
  const name = body.name.trim();
  const tutor = body.tutor.trim();
  const members = body.members.map((m: unknown) => String(m).trim()).filter(Boolean);
  if (!name || name.length > 60) return null;
  if (!tutor || tutor.length > 60) return null;
  if (members.length === 0 || members.length > 5) return null;
  if (members.some((m: string) => m.length > 60)) return null;
  return { name, tutor, members };
}

export function validateScore(
  body: any
): { teamId: string; memberId: string; pillar: string; stage: string; points: number } | null {
  if (!body) return null;
  const { teamId, memberId, pillar, stage } = body;
  const points = Number(body.points);
  if (typeof teamId !== "string" || typeof memberId !== "string") return null;
  if (!PILLARS.has(pillar) || !STAGES.has(stage)) return null;
  if (!Number.isFinite(points) || points < 0 || points > STAGE_MAX[stage]) return null;
  return { teamId, memberId, pillar, stage, points };
}
