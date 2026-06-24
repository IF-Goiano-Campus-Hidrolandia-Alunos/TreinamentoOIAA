import { Navigate, useParams } from "react-router";
import { getChallenge } from "../lib/challenges";
import { STAGES, STAGE_ORDER, getStage } from "../lib/stages";
import { getCode } from "../lib/code-snippets";
import { usePillarProgress, useStageProgress } from "../lib/use-stage-progress";
import type { PillarId, StageId } from "../lib/types";
import { StageHeader } from "../components/trilha/StageHeader";
import { StageTrack } from "../components/trilha/StageTrack";
import { TheoryStage } from "../components/trilha/stages/TheoryStage";
import { GuidedStage } from "../components/trilha/stages/GuidedStage";
import { UnguidedStage } from "../components/trilha/stages/UnguidedStage";
import { FillBlanksStage } from "../components/trilha/stages/FillBlanksStage";
import { FromScratchStage } from "../components/trilha/stages/FromScratchStage";

const VALID_PILLARS: PillarId[] = ["nlp", "vc", "am"];

const STAGE_VIEWS: Record<StageId, React.FC<any>> = {
  theory: TheoryStage,
  guided: GuidedStage,
  unguided: UnguidedStage,
  "fill-blanks": FillBlanksStage,
  "from-scratch": FromScratchStage,
};

export function StageDetailPage() {
  const { pillar, stage } = useParams<{ pillar: string; stage: string }>();

  if (!pillar || !VALID_PILLARS.includes(pillar as PillarId))
    return <Navigate to="/challenges" replace />;
  if (!stage || !STAGE_ORDER.includes(stage as StageId))
    return <Navigate to={`/challenges/${pillar}`} replace />;

  const p = pillar as PillarId;
  const s = stage as StageId;
  const stageObj = getStage(s);
  const challenge = getChallenge(p);
  const needsCode = s === "fill-blanks" || s === "from-scratch";
  const code = needsCode ? getCode(p) : undefined;

  const { progress, update } = useStageProgress(p, s);
  const { completed } = usePillarProgress(p);
  const View = STAGE_VIEWS[s];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <StageHeader pillar={p} stage={stageObj} completedCount={completed} />

      <div className="mt-8 grid lg:grid-cols-[300px_1fr] gap-8">
        <aside className="lg:sticky lg:top-20 lg:self-start hidden lg:block">
          <StageTrack pillar={p} stages={STAGES} activeStage={s} />
        </aside>

        <div>
          <View
            pillar={p}
            challenge={challenge}
            stage={stageObj}
            code={code}
            progress={progress}
            onProgressChange={update}
          />
        </div>
      </div>
    </div>
  );
}
