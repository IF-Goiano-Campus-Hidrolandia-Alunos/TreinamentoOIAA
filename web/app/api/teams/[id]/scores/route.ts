import { NextResponse } from "next/server";
import { submitScore } from "@/lib/teams-store";
import { rankTeams } from "@/lib/scoring";
import { listTeams } from "@/lib/teams-store";
import { authorize } from "@/lib/auth";
import { submitScoreSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

// POST /api/teams/:id/scores -> lanca/atualiza a nota de um integrante (admin/tutor).
// body: { memberId, pillar, stage, points }
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = authorize(req);
  if (!auth.ok) return auth.res;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const parsed = submitScoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await submitScore(params.id, parsed.data);
  if (!result.ok) {
    const msg = result.reason === "team-not-found" ? "Time nao encontrado." : "Integrante nao encontrado.";
    return NextResponse.json({ error: msg }, { status: 404 });
  }

  const team = rankTeams(await listTeams()).find((t) => t.id === params.id);
  return NextResponse.json({ team }, { status: 201 });
}
