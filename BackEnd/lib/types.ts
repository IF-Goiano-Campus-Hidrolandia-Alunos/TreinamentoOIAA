// Tipos do BackEnd. A API trabalha com Team[] "cru"; o ranking/nota e calculado
// no FrontEnd (mesmo formato de Team nos dois lados).

export type PillarId = "nlp" | "vc" | "am";
export type StageId =
  | "theory"
  | "guided"
  | "unguided"
  | "fill-blanks"
  | "from-scratch";

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
