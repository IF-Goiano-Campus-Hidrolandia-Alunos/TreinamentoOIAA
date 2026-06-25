import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useMemberSession } from "../../lib/member-session";
import { useTeams } from "../../lib/teams-store";
import { QUIZZES, Question } from "../../lib/quizzes";
import { ACCENT } from "../../lib/accents";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Award, Loader2 } from "lucide-react";
import type { PillarId, StageId } from "../../lib/types";

interface QuizComponentProps {
  pillar: PillarId;
  stage: StageId;
}

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const api = (path: string) => `${API_BASE}${path}`;

export function QuizComponent({ pillar, stage }: QuizComponentProps) {
  const { member, submitStageScore } = useMemberSession();
  const { mode, teams } = useTeams();
  const a = ACCENT[pillar];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedPoints, setSubmittedPoints] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Obter pontuacao atual se houver
  const currentBestScore = (() => {
    if (!member) return 0;
    const team = teams.find((t) => t.id === member.teamId);
    const mem = team?.members.find((m) => m.id === member.id);
    const score = mem?.scores.find((s) => s.pillar === pillar && s.stage === stage);
    return score ? score.points : 0;
  })();

  const maxPointsMap: Record<StageId, number> = {
    theory: 10,
    guided: 15,
    unguided: 20,
    "fill-blanks": 25,
    "from-scratch": 30,
  };
  const maxPoints = maxPointsMap[stage] || 0;

  // Carregar as questoes do quiz
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (mode === "api") {
          const res = await fetch(api(`/api/quiz?pillar=${pillar}&stage=${stage}`));
          if (!res.ok) {
            throw new Error("Nao foi possivel carregar o quiz do servidor.");
          }
          const data = await res.json() as { questions: Question[] };
          if (active) {
            setQuestions(data.questions || []);
          }
        } else {
          // Modo local: ler e sanitizar questoes locais
          const localQuestions = QUIZZES[pillar]?.[stage] || [];
          const sanitized = localQuestions.map(({ correctIndex, ...q }) => q);
          if (active) {
            setQuestions(sanitized);
          }
        }
      } catch (err: any) {
        console.error(err);
        if (active) {
          setError(err.message || "Erro ao carregar questoes.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [pillar, stage, mode]);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (submitting || submittedPoints !== null) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!member) {
      toast.error("Voce precisa se identificar primeiro.");
      return;
    }

    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      toast.error(`Por favor, responda todas as ${questions.length} perguntas.`);
      return;
    }

    setSubmitting(true);
    try {
      const answersArray = questions.map((_, i) => selectedAnswers[i]);
      const result = await submitStageScore(pillar, stage, "quiz", { answers: answersArray });
      setSubmittedPoints(result.points);
      toast.success(`Quiz submetido! Pontuacao: ${result.points} / ${maxPoints} (Melhor: ${result.best})`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao enviar respostas.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!member) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#0b0b14] p-6 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-md font-semibold font-display">Identificacao Requerida</h3>
        <p className="text-sm text-white/60 max-w-sm mx-auto">
          Voce precisa se identificar com seu codigo de acesso para responder ao quiz e enviar suas respostas automaticamente para o placar.
        </p>
        <Link
          to="/entrar"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white transition-all shadow-[0_0_15px_-3px_rgba(167,139,250,0.4)]"
        >
          Entrar com Codigo de Acesso
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#0b0b14] p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400 mx-auto mb-2" />
        <span className="text-sm text-white/40">Carregando quiz de fixacao...</span>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#0b0b14] p-6 text-center text-white/50 text-sm">
        Nenhum quiz disponivel para este estagio.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="font-display font-bold text-white text-md">Quiz de Fixacao</h3>
          <p className="text-xs text-white/40">Responda as perguntas abaixo para testar seu conhecimento.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono">
          <Award className={`w-4 h-4 ${a.text}`} />
          <span className="text-white/60">Sua Nota:</span>
          <span className="font-bold text-white">{currentBestScore} / {maxPoints} pts</span>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={q.id} className="space-y-3">
            <h4 className="text-sm font-medium text-white/90">
              {qIdx + 1}. {q.text}
            </h4>
            <div className="grid gap-2">
              {q.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[qIdx] === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(qIdx, oIdx)}
                    disabled={submitting || submittedPoints !== null}
                    className={`text-left text-xs px-4 py-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? `${a.border} ${a.bgSoft} text-white font-medium`
                        : "border-white/5 bg-white/[0.01] text-white/70 hover:bg-white/5 hover:text-white"
                    } disabled:cursor-not-allowed`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {submittedPoints === null && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all text-white bg-violet-600 hover:bg-violet-500 shadow-[0_0_20px_-5px_rgba(167,139,250,0.4)] disabled:opacity-50 cursor-pointer`}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enviando respostas...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Enviar Respostas do Quiz</span>
            </>
          )}
        </button>
      )}

      {submittedPoints !== null && (
        <div className={`rounded-lg border ${a.border} ${a.bgSoft} p-4 text-center space-y-2`}>
          <div className="text-sm font-semibold text-white">Submissao Concluida!</div>
          <p className="text-xs text-white/60">
            Sua pontuacao nesta tentativa foi de <span className="font-bold text-white">{submittedPoints} / {maxPoints}</span>.
          </p>
          <button
            onClick={() => {
              setSubmittedPoints(null);
              setSelectedAnswers({});
            }}
            className="text-xs text-violet-400 hover:underline mt-2 inline-block cursor-pointer bg-none border-none"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
