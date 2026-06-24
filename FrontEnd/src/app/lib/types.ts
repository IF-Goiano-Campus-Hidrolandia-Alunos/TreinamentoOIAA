export type PillarId = "nlp" | "vc" | "am";
export type StageId =
  | "theory"
  | "guided"
  | "unguided"
  | "fill-blanks"
  | "from-scratch";

export type StageMode = "blocks" | "scratch";

export interface Pillar {
  id: PillarId;
  name: string;
  shortName: string;
  tagline: string;
}

export interface KeyConcept {
  term: string;
  definition: string;
}

export interface Challenge {
  pillar: PillarId;
  title: string;
  description: string[];
  keyConcepts: KeyConcept[];
  steps: string[];
  dataset: string;
  narrative: string;
}

export interface Stage {
  id: StageId;
  order: number;
  title: string;
  short: string;
  goal: string;
  hasAssistance: boolean;
  maxPoints: number;
  details: string[];
  modes?: StageMode[];
}

export interface PillarStages {
  pillar: PillarId;
  stages: Stage[];
}

export interface CodeBlock {
  id: string;
  title: string;
  language: string;
  code: string;
  hasPlaceholder?: boolean;
}

export interface PillarCode {
  pillar: PillarId;
  blocks: CodeBlock[];
}

export interface ScoreEntry {
  pillar: PillarId;
  stage: StageId;
  points: number;
}

export interface Member {
  id: string;
  name: string;
  scores: ScoreEntry[];
}

export interface Team {
  id: string;
  name: string;
  tutor: string;
  members: Member[];
  createdAt: string;
}

export interface MemberScored extends Member {
  individualScore: number;
  stagesCompleted: number;
}

export interface TeamRanked {
  id: string;
  name: string;
  tutor: string;
  createdAt: string;
  members: MemberScored[];
  groupScore: number;
  rank: number;
}

export type TeamSortKey = "name" | "groupScore" | "createdAt";
export type SortOrder = "asc" | "desc";

export interface StageProgress {
  pillar: PillarId;
  stage: StageId;
  completed: boolean;
  checklist?: Record<string, boolean>;
  notes?: string;
  modes?: Partial<Record<StageMode, boolean>>;
  updatedAt?: string;
}
