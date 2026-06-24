import type {
  Challenge,
  PillarCode,
  PillarId,
  Stage,
  StageProgress,
} from "../../../lib/types";

export interface StageViewProps {
  pillar: PillarId;
  challenge: Challenge;
  stage: Stage;
  code?: PillarCode;
  progress: StageProgress;
  onProgressChange: (next: Partial<StageProgress>) => void;
}
