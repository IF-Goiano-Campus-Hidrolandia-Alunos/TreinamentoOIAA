import type {
  Member,
  MemberScored,
  Team,
  TeamRanked,
  TeamSortKey,
  SortOrder,
} from "./types";
import { MAX_POINTS_TOTAL, STAGE_MAX_POINTS } from "./stages";

export function scoreMember(member: Member): MemberScored {
  const totalPoints = member.scores.reduce((sum, s) => {
    const cap = STAGE_MAX_POINTS[s.stage];
    return sum + Math.min(s.points, cap);
  }, 0);
  const normalized = (totalPoints / MAX_POINTS_TOTAL) * 100;
  return {
    ...member,
    individualScore: Math.round(normalized * 10) / 10,
    stagesCompleted: member.scores.filter((s) => s.points > 0).length,
  };
}

export function groupScore(scored: MemberScored[]): number {
  if (scored.length === 0) return 0;
  const avg =
    scored.reduce((s, m) => s + m.individualScore, 0) / scored.length;
  return Math.round(avg * 10) / 10;
}

export function rankTeams(
  teams: Team[],
  opts: { sortBy: TeamSortKey; order: SortOrder } = {
    sortBy: "groupScore",
    order: "desc",
  }
): TeamRanked[] {
  const computed = teams.map((t) => {
    const members = t.members.map(scoreMember);
    return {
      id: t.id,
      name: t.name,
      tutor: t.tutor,
      createdAt: t.createdAt,
      members,
      groupScore: groupScore(members),
      rank: 0,
    } as TeamRanked;
  });

  const sorted = [...computed].sort((a, b) => {
    let diff = 0;
    if (opts.sortBy === "name") diff = a.name.localeCompare(b.name);
    else if (opts.sortBy === "createdAt")
      diff = a.createdAt.localeCompare(b.createdAt);
    else diff = a.groupScore - b.groupScore;
    return opts.order === "asc" ? diff : -diff;
  });

  const byScore = [...computed].sort((a, b) => b.groupScore - a.groupScore);
  const rankMap = new Map<string, number>();
  byScore.forEach((t, i) => rankMap.set(t.id, i + 1));
  sorted.forEach((t) => (t.rank = rankMap.get(t.id) ?? 0));
  return sorted;
}
