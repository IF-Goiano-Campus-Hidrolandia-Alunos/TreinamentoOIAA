import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useMemberSession } from "../../lib/member-session";
import { useTeams } from "../../lib/teams-store";
import { ACCENT } from "../../lib/accents";
import { toast } from "sonner";
import { Award, AlertCircle, Loader2, Send, HelpCircle, UploadCloud } from "lucide-react";
import type { PillarId, StageId } from "../../lib/types";

interface MetricSubmissionComponentProps {
  pillar: PillarId;
  stage: StageId;
}

const configMap = {
  vc: {
    name: "Acuracia",
    lowerIsBetter: false,
    baseline: 0.20,
    target: 0.95,
    placeholder: "Ex: 0.85 (Acuracia de 0 a 1)",
  },
  am: {
    name: "RMSE",
    lowerIsBetter: true,
    baseline: 1.50,
    target: 0.80,
    placeholder: "Ex: 0.95 (RMSE menor e melhor)",
  },
  nlp: {
    name: "Acuracia",
    lowerIsBetter: false,
    baseline: 0.10,
    target: 0.90,
    placeholder: "Ex: 0.78 (Acuracia de 0 a 1)",
  },
};

const maxPointsMap: Record<StageId, number> = {
  theory: 10,
  guided: 15,
  unguided: 20,
  "fill-blanks": 25,
  "from-scratch": 30,
};

export function MetricSubmissionComponent({ pillar, stage }: MetricSubmissionComponentProps) {
  const { member, submitStageScore } = useMemberSession();
  const { teams } = useTeams();
  const a = ACCENT[pillar];
  const config = configMap[pillar];
  const maxPoints = maxPointsMap[stage] || 0;

  const [metricValue, setMetricValue] = useState("");
  const [selectedMode, setSelectedMode] = useState<"blocks" | "scratch">("blocks");
  const [submitting, setSubmitting] = useState(false);
  const [estimatedPoints, setEstimatedPoints] = useState<number | null>(null);
  const [csvSubmitting, setCsvSubmitting] = useState(false);

  // Obter pontuacao atual se houver
  const currentBestScore = (() => {
    if (!member) return 0;
    const team = teams.find((t) => t.id === member.teamId);
    const mem = team?.members.find((m) => m.id === member.id);
    const score = mem?.scores.find((s) => s.pillar === pillar && s.stage === stage);
    return score ? score.points : 0;
  })();

  // Calcular pontos estimados em tempo real
  useEffect(() => {
    const val = Number(metricValue);
    if (isNaN(val) || metricValue.trim() === "") {
      setEstimatedPoints(null);
      return;
    }

    let norm = 0;
    if (config.lowerIsBetter) {
      if (val >= config.baseline) {
        norm = 0;
      } else if (val <= config.target) {
        norm = 1;
      } else {
        norm = (config.baseline - val) / (config.baseline - config.target);
      }
    } else {
      if (val <= config.baseline) {
        norm = 0;
      } else if (val >= config.target) {
        norm = 1;
      } else {
        norm = (val - config.baseline) / (config.target - config.baseline);
      }
    }
    norm = Math.max(0, Math.min(1, norm));
    setEstimatedPoints(Math.round(maxPoints * norm));
  }, [metricValue, config, maxPoints]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) {
      toast.error("Voce precisa se identificar primeiro.");
      return;
    }

    const val = Number(metricValue);
    if (isNaN(val) || metricValue.trim() === "") {
      toast.error(`Por favor, insira um valor numerico valido para o ${config.name}.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = { value: val };
      if (stage === "from-scratch") {
        payload.mode = selectedMode;
      }

      const result = await submitStageScore(pillar, stage, "metric", payload);
      toast.success(`Metrica enviada! Pontos ganhos: ${result.points} (Melhor: ${result.best})`);
      setMetricValue("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao enviar metrica.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!member) {
      toast.error("Voce precisa se identificar primeiro.");
      return;
    }
    setCsvSubmitting(true);
    try {
      const text = await file.text();
      const payload: any = { csv: text };
      if (stage === "from-scratch") payload.mode = selectedMode;
      const result = await submitStageScore(pillar, stage, "csv", payload);
      toast.success(`CSV corrigido! Pontos: ${result.points} (Melhor: ${result.best})`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao corrigir o CSV.");
    } finally {
      setCsvSubmitting(false);
    }
  };

  if (!member) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#0b0b14] p-6 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-md font-semibold font-display">Identificacao Requerida</h3>
        <p className="text-sm text-white/60 max-w-sm mx-auto">
          Voce precisa se identificar com seu codigo de acesso para enviar sua metrica e atualizar sua pontuacao no placar.
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

  return (
    <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="font-display font-bold text-white text-md">Pontuar por Metrica</h3>
          <p className="text-xs text-white/40">Insira a metrica alcancada no seu notebook para calcular sua nota.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono">
          <Award className={`w-4 h-4 ${a.text}`} />
          <span className="text-white/60">Melhor Nota:</span>
          <span className="font-bold text-white">{currentBestScore} / {maxPoints} pts</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {stage === "from-scratch" && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider">
              Modo de Execucao
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMode("blocks")}
                className={`py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  selectedMode === "blocks"
                    ? `${a.border} ${a.bgSoft} text-white`
                    : "border-white/5 bg-white/[0.01] text-white/60 hover:text-white"
                }`}
              >
                Com Blocos
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode("scratch")}
                className={`py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  selectedMode === "scratch"
                    ? `${a.border} ${a.bgSoft} text-white`
                    : "border-white/5 bg-white/[0.01] text-white/60 hover:text-white"
                }`}
              >
                Do Zero (Scratch)
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="metric-input" className="block text-xs font-semibold text-white/40 uppercase tracking-wider">
            {config.name} alcancado
          </label>
          <div className="relative">
            <input
              id="metric-input"
              type="text"
              inputMode="decimal"
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
              placeholder={config.placeholder}
              className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all text-sm font-mono"
              disabled={submitting}
            />
            {estimatedPoints !== null && (
              <span className="absolute right-3 top-3 text-xs font-mono text-emerald-400">
                +{estimatedPoints} pts estimados
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 space-y-2 text-xs text-white/50 leading-relaxed">
          <div className="flex items-center gap-1.5 text-white/70 font-semibold uppercase tracking-wider text-[10px]">
            <HelpCircle className="w-3.5 h-3.5" /> Parametros de Pontuacao
          </div>
          <p>
            Para o pilar <span className="font-bold text-white uppercase">{pillar}</span>, a baseline e de{" "}
            <span className="font-semibold text-white font-mono">{config.baseline}</span> (0 pts) e o alvo maximo e de{" "}
            <span className="font-semibold text-white font-mono">{config.target}</span> ({maxPoints} pts).
            {config.lowerIsBetter ? " Valores menores geram mais pontos." : " Valores maiores geram mais pontos."}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white shadow-[0_0_20px_-5px_rgba(167,139,250,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enviando metrica...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Enviar Metrica e Pontuar</span>
            </>
          )}
        </button>
      </form>

      <div className="border-t border-white/5 pt-5 space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 font-mono">
          <UploadCloud className="w-3.5 h-3.5" /> Correcao automatica por CSV (estilo Kaggle)
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          Envie o arquivo <span className="font-mono text-white/70">submission.csv</span> (colunas{" "}
          <span className="font-mono text-white/70">id,valor</span>). O servidor compara com o
          gabarito cadastrado pelo tutor e calcula a {config.name} automaticamente — sem digitar a
          metrica manualmente.
        </p>
        <label
          className={`flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed ${a.border} ${a.bgSoft} text-sm text-white cursor-pointer hover:bg-white/5 transition-all ${
            csvSubmitting ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {csvSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UploadCloud className="w-4 h-4" />
          )}
          <span>{csvSubmitting ? "Corrigindo CSV..." : "Selecionar e enviar CSV de previsoes"}</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsvUpload}
            disabled={csvSubmitting}
          />
        </label>
      </div>
    </div>
  );
}
