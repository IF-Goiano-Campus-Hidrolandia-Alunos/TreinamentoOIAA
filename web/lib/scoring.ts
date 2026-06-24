import type {
  Member,
  MemberScored,
  SortOrder,
  Team,
  TeamRanked,
  TeamSortKey,
} from "@/lib/types";
import { MAX_POINTS_TOTAL } from "@/lib/stages";

// Fonte unica da verdade para o calculo de notas.
//  - Nota individual = (pontos do integrante / MAX_POINTS_TOTAL) * 100
//  - Nota do grupo  = media das notas individuais dos integrantes (tutor excluido)

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function memberPoints(member: Member): number {
  return member.scores.reduce((sum, s) => sum + s.points, 0);
}

/** Quantas etapas (pilar+stage) distintas o integrante ja pontuou. */
export function completedStages(member: Member): number {
  const seen = new Set(member.scores.map((s) => `${s.pillar}:${s.stage}`));
  return seen.size;
}

export function scoreMember(member: Member): MemberScored {
  const points = memberPoints(member);
  return {
    id: member.id,
    name: member.name,
    points: round1(points),
    score: round1((points / MAX_POINTS_TOTAL) * 100),
    completedStages: completedStages(member),
  };
}

/** Nota do grupo: media das notas individuais (tutor nunca entra). */
export function groupScore(team: Team): number {
  if (team.members.length === 0) return 0;
  const avg =
    team.members.reduce((sum, m) => sum + scoreMember(m).score, 0) / team.members.length;
  return round1(avg);
}

export interface RankOptions {
  sortBy?: TeamSortKey;
  order?: SortOrder;
}

/**
 * Ranqueia os times. A posicao e SEMPRE definida pela nota do grupo (desc);
 * a ordenacao de exibicao pode ser outra (sortBy/order).
 */
export function rankTeams(teams: Team[], opts: RankOptions = {}): TeamRanked[] {
  const { sortBy = "groupScore", order = "desc" } = opts;

  // Posicoes pela nota do grupo (desc), desempate por nome.
  const byScore = [...teams].sort((a, b) => {
    const d = groupScore(b) - groupScore(a);
    return d !== 0 ? d : a.name.localeCompare(b.name);
  });
  const positions = new Map<string, number>();
  byScore.forEach((t, i) => positions.set(t.id, i + 1));

  const ranked: TeamRanked[] = teams.map((t) => ({
    id: t.id,
    name: t.name,
    tutor: t.tutor,
    members: t.members.map(scoreMember),
    groupScore: groupScore(t),
    position: positions.get(t.id) ?? 0,
    createdAt: t.createdAt,
  }));

  const dir = order === "asc" ? 1 : -1;
  ranked.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
    if (sortBy === "createdAt") return a.createdAt.localeCompare(b.createdAt) * dir;
    const d = (a.groupScore - b.groupScore) * dir;
    return d !== 0 ? d : a.name.localeCompare(b.name);
  });

  return ranked;
}
