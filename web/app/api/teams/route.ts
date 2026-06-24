import { NextResponse } from "next/server";
import { createTeam, listTeams } from "@/lib/teams-store";
import { rankTeams } from "@/lib/scoring";
import { createTeamSchema } from "@/lib/validation";
import type { SortOrder, TeamSortKey } from "@/lib/types";

export const dynamic = "force-dynamic";

const SORT_KEYS: TeamSortKey[] = ["name", "groupScore", "createdAt"];

// GET /api/teams?search=&sortBy=groupScore&order=desc -> times ranqueados (placar).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();
  const sortByRaw = url.searchParams.get("sortBy");
  const orderRaw = url.searchParams.get("order");

  const sortBy: TeamSortKey = SORT_KEYS.includes(sortByRaw as TeamSortKey)
    ? (sortByRaw as TeamSortKey)
    : "groupScore";
  const order: SortOrder = orderRaw === "asc" ? "asc" : "desc";

  let teams = rankTeams(await listTeams(), { sortBy, order });
  if (search) {
    teams = teams.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.tutor.toLowerCase().includes(search) ||
        t.members.some((m) => m.name.toLowerCase().includes(search)),
    );
  }

  return NextResponse.json({ teams });
}

// POST /api/teams -> cria um time (ABERTO: alunos se organizam).
// body: { name, tutor, members: string[] }
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const team = await createTeam(parsed.data, new Date().toISOString());
  return NextResponse.json({ team }, { status: 201 });
}
