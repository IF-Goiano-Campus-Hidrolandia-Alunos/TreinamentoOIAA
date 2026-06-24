// Tipos compartilhados por todo o backend (data layer + API routes + UI).

// ---------------------------------------------------------------------------
// Pilares
// ---------------------------------------------------------------------------

/** Identificador de cada pilar do desafio. */
export type PillarId = "nlp" | "vc" | "am";

/** Metadado visual/textual de um pilar. */
export interface Pillar {
  id: PillarId;
  /** Sigla curta (NLP / VC / AM). */
  abbr: string;
  /** Nome completo do pilar. */
  name: string;
  /** Titulo do desafio extraido do notebook Kaggle. */
  challengeTitle: string;
  /** Frase de efeito curta para cards. */
  tagline: string;
  /** Cor de destaque (token CSS) usada na identidade visual. */
  accent: "nlp" | "vc" | "am";
  /** Nome amigavel da cor para o front. */
  accentLabel: string;
}

/** Conteudo descritivo completo de um desafio. */
export interface Challenge extends Pillar {
  description: string[];
  keyConcepts: { term: string; definition: string }[];
  steps: string[];
  dataset: string;
}

// ---------------------------------------------------------------------------
// Etapas (as 5 partes de cada desafio)
// ---------------------------------------------------------------------------

/**
 * As 5 partes de cada pilar, em ordem de dificuldade:
 *  theory       -> teoria (explicacoes, resumos)
 *  guided       -> treinamento basico COM auxilio
 *  unguided     -> treinamento SEM auxilio
 *  fill-blanks  -> preencher lacunas de codigo
 *  from-scratch -> programar a IA do zero (com blocos e do zero)
 */
export type StageId = "theory" | "guided" | "unguided" | "fill-blanks" | "from-scratch";

export type FromScratchMode = "blocks" | "scratch";

export interface Stage {
  id: StageId;
  /** Ordem (1..5). */
  order: number;
  title: string;
  /** Resumo de 1 linha. */
  short: string;
  /** Objetivo da etapa. */
  goal: string;
  /** Tem auxilio/dicas guiadas? */
  hasAssistance: boolean;
  /** Pontos que a etapa vale (por integrante). */
  maxPoints: number;
  /** Bullets de conteudo/explicacao. */
  details: string[];
  /** Apenas na etapa from-scratch: modos exigidos. */
  modes?: FromScratchMode[];
}

export interface PillarStages {
  pillar: PillarId;
  stages: Stage[];
}

// ---------------------------------------------------------------------------
// Codigo (esqueletos da fase de codigo)
// ---------------------------------------------------------------------------

export interface CodeBlock {
  id: string;
  title: string;
  language: string;
  code: string;
  highlight?: boolean;
}

export interface PillarCode {
  pillar: PillarId;
  blocks: CodeBlock[];
}

// ---------------------------------------------------------------------------
// Times, integrantes e notas
// ---------------------------------------------------------------------------

/** Uma nota lancada para um integrante numa etapa de um pilar. */
export interface ScoreEntry {
  pillar: PillarId;
  stage: StageId;
  /** Pontos obtidos (0..maxPoints da etapa). */
  points: number;
}

export interface Member {
  id: string;
  name: string;
  /** Notas do integrante (uma por pilar/etapa concluida). */
  scores: ScoreEntry[];
}

export interface Team {
  id: string;
  name: string;
  /** Nome do tutor. NUNCA entra na media do grupo. */
  tutor: string;
  members: Member[];
  /** ISO date de criacao. */
  createdAt: string;
}

/** Integrante ja com notas calculadas (saida da API). */
export interface MemberScored {
  id: string;
  name: string;
  /** Soma de pontos do integrante. */
  points: number;
  /** Nota individual normalizada 0..100. */
  score: number;
  /** Quantas das 15 etapas (3 pilares x 5) o integrante ja tem nota. */
  completedStages: number;
}

/** Time ja com notas calculadas e posicao no ranking (saida da API). */
export interface TeamRanked {
  id: string;
  name: string;
  tutor: string;
  members: MemberScored[];
  /** Nota do grupo = media das notas individuais (tutor excluido), 0..100. */
  groupScore: number;
  position: number;
  createdAt: string;
}

export type TeamSortKey = "name" | "groupScore" | "createdAt";
export type SortOrder = "asc" | "desc";
