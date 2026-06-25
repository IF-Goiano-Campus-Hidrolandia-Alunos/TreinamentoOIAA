import { Link } from "react-router";
import { BookOpen, CheckCircle2, Database, Trophy } from "lucide-react";
import { ACCENT } from "../../../lib/accents";
import { AncientManuscript } from "../../manuscript/AncientManuscript";
import type { StageViewProps } from "./types";
import { QuizComponent } from "../QuizComponent";

function PillarFlavor({ pillar }: { pillar: StageViewProps["pillar"] }) {
  if (pillar === "nlp") return <AncientManuscript />;
  if (pillar === "vc")
    return (
      <div className="rounded-lg border border-cyan-400/30 bg-[#0c0c12] p-6">
        <div className="text-[10px] uppercase tracking-widest font-mono text-cyan-300">
          Exemplos do dataset
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {[
            { label: "PARE", color: "bg-red-500/80" },
            { label: "50", color: "bg-white text-black" },
            { label: "PARE", color: "bg-red-500/80" },
            { label: "80", color: "bg-white text-black" },
            { label: "60", color: "bg-white text-black" },
            { label: "PARE", color: "bg-red-500/80" },
            { label: "30", color: "bg-white text-black" },
            { label: "PARE", color: "bg-red-500/80" },
          ].map((p, i) => (
            <div
              key={i}
              className={`aspect-square rounded-md ${p.color} text-white flex items-center justify-center font-display border-2 border-white/20`}
            >
              {p.label}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/40">
          43 classes (subconjunto GTSRB) — distinguir Pare vs Velocidade Máxima.
        </p>
      </div>
    );
  return (
    <div className="rounded-lg border border-emerald-400/30 bg-[#0c0c12] p-6">
      <div className="text-[10px] uppercase tracking-widest font-mono text-emerald-300">
        Estrutura dos dados
      </div>
      <table className="mt-4 w-full text-sm font-mono">
        <thead className="text-left text-white/40 border-b border-white/10">
          <tr>
            <th className="py-2 pr-4">userId</th>
            <th className="py-2 pr-4">movieId</th>
            <th className="py-2">rating</th>
          </tr>
        </thead>
        <tbody>
          {[
            [1, 1193, 5],
            [1, 661, 3],
            [1, 914, 3],
            [2, 1357, 5],
            [2, 3068, 4],
            [3, 1287, 5],
          ].map((row, i) => (
            <tr key={i} className="border-b border-white/5">
              <td className="py-2 pr-4 text-white">{row[0]}</td>
              <td className="py-2 pr-4 text-white/80">{row[1]}</td>
              <td className="py-2 text-emerald-300">{row[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-white/40">
        Cada linha é uma interação. O modelo precisa prever a nota para pares
        (usuário, filme) que ainda não existem.
      </p>
    </div>
  );
}

export function TheoryStage({
  pillar,
  challenge,
  stage,
  progress,
  onProgressChange,
}: StageViewProps) {
  const a = ACCENT[pillar];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <section className="rounded-xl border border-white/10 bg-[#0c0c12] p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 font-mono">
            <BookOpen className="w-3.5 h-3.5" /> Narrativa
          </div>
          {challenge.description.map((p, i) => (
            <p key={i} className="text-white/70 leading-relaxed">
              {p}
            </p>
          ))}
        </section>

        <PillarFlavor pillar={pillar} />

        <section className="rounded-xl border border-white/10 bg-[#0c0c12] p-6">
          <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
            Conceitos-chave
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {challenge.keyConcepts.map((kc) => (
              <div
                key={kc.term}
                className={`rounded-lg border ${a.border} ${a.bgSoft} p-4`}
              >
                <div className={`font-display ${a.text}`}>{kc.term}</div>
                <p className="mt-1 text-sm text-white/60">{kc.definition}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#0c0c12] p-6">
          <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
            Pontos de teoria
          </div>
          <ul className="mt-3 space-y-2">
            {stage.details.map((d) => (
              <li key={d} className="flex gap-2 text-sm text-white/80">
                <span className={a.text}>▸</span> {d}
              </li>
            ))}
          </ul>
        </section>

        <QuizComponent pillar={pillar} stage={stage.id} />
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 font-mono">
            <Database className="w-3.5 h-3.5" /> Sobre os dados
          </div>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            {challenge.dataset}
          </p>
        </div>

        <button
          onClick={() => onProgressChange({ completed: !progress.completed })}
          className={`w-full rounded-md border ${a.border} ${
            progress.completed ? a.bgSoft : "bg-white/[0.02]"
          } px-4 py-3 text-sm text-white inline-flex items-center justify-center gap-2 transition-all hover:bg-white/5`}
        >
          <CheckCircle2 className={`w-4 h-4 ${progress.completed ? a.text : ""}`} />
          {progress.completed ? "Teoria marcada como lida" : "Marcar teoria como lida"}
        </button>

        <Link
          to={`/challenges/${pillar}/guided`}
          className="block w-full rounded-md bg-white text-black px-4 py-3 text-sm text-center hover:bg-white/90"
        >
          Ir para o treino guiado →
        </Link>

        <div className={`rounded-xl border ${a.border} ${a.bgSoft} p-4 text-xs text-white/60`}>
          <Trophy className={`inline w-3.5 h-3.5 mr-1 ${a.text}`} />A nota oficial é
          lançada pelo tutor em <Link to="/admin" className="underline">/admin</Link> e
          aparece em <Link to="/leaderboard" className="underline">/placar</Link>.
        </div>
      </aside>
    </div>
  );
}
