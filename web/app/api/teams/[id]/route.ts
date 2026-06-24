import { NextResponse } from "next/server";
import { deleteTeam, getTeam, listTeams } from "@/lib/teams-store";
import { rankTeams } from "@/lib/scoring";
import { authorize } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/teams/:id -> detalhe do time (ja com notas e posicao).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await getTeam(params.id))) {
    return NextResponse.json({ error: "Time nao encontrado." }, { status: 404 });
  }
  const team = rankTeams(await listTeams()).find((t) => t.id === params.id);
  return NextResponse.json({ team });
}

// DELETE /api/teams/:id -> remove o time (admin/tutor).
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = authorize(req);
  if (!auth.ok) return auth.res;

  const removed = await deleteTeam(params.id);
  if (!removed) return NextResponse.json({ error: "Time nao encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
