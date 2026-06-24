import { NextResponse } from "next/server";
import { getAllChallenges, PILLAR_ORDER } from "@/lib/challenges";
import { getStages, POINTS_PER_PILLAR, MAX_POINTS_TOTAL } from "@/lib/stages";

// GET /api/challenges -> conteudo dos 3 desafios + as 5 etapas de cada pilar.
export function GET() {
  return NextResponse.json({
    challenges: getAllChallenges(),
    stages: PILLAR_ORDER.map((id) => getStages(id)),
    scoring: { pointsPerPillar: POINTS_PER_PILLAR, maxPointsTotal: MAX_POINTS_TOTAL },
  });
}
