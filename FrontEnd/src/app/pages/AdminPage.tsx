import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ADMIN_TOKEN_DEMO, useTeams } from "../lib/teams-store";
import { STAGE_MAX_POINTS, STAGE_ORDER, getStage } from "../lib/stages";
import { PILLARS } from "../lib/challenges";
import type { PillarId, StageId } from "../lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const TOKEN_KEY = "ifg-admin-token";

export function AdminPage() {
  const [token, setToken] = useState<string>("");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t === ADMIN_TOKEN_DEMO) {
      setToken(t);
      setAuthed(true);
    }
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (token === ADMIN_TOKEN_DEMO) {
      localStorage.setItem(TOKEN_KEY, token);
      setAuthed(true);
      toast.success("Token aceito");
    } else {
      toast.error("Token inválido");
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setAuthed(false);
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-8 cyber-radial">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 font-mono">
            <ShieldAlert className="w-3.5 h-3.5" /> Área restrita
          </div>
          <h1 className="font-display text-2xl text-white mt-2">Painel do Tutor</h1>
          <p className="mt-2 text-sm text-white/60">
            Insira o token para acessar. Token demo:{" "}
            <code className="font-mono text-violet-300">{ADMIN_TOKEN_DEMO}</code>
          </p>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="x-admin-token"
              className="w-full rounded-md bg-white/[0.04] border border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40 font-mono"
            />
            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-md bg-white text-black text-sm hover:bg-white/90 transition-all"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={logout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { teams, ranked, submitScore, deleteTeam } = useTeams();
  const ranks = ranked({ sortBy: "groupScore", order: "desc" });

  const [teamId, setTeamId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [pillar, setPillar] = useState<PillarId>("nlp");
  const [stage, setStage] = useState<StageId>("theory");
  const [points, setPoints] = useState<number>(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const team = useMemo(() => teams.find((t) => t.id === teamId), [teams, teamId]);

  function launch(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId || !memberId) {
      toast.error("Selecione time e integrante");
      return;
    }
    const cap = STAGE_MAX_POINTS[stage];
    if (points < 0 || points > cap) {
      toast.error(`Pontos devem estar entre 0 e ${cap}`);
      return;
    }
    submitScore(teamId, { memberId, pillar, stage, points });
    toast.success("Nota lançada");
    setPoints(0);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-300 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" /> Autenticado
          </div>
          <h1 className="font-display text-4xl text-white mt-2">Painel do Tutor</h1>
        </div>
        <button
          onClick={onLogout}
          className="text-xs px-3 py-1.5 rounded-md border border-white/10 text-white/60 hover:text-white hover:border-white/20"
        >
          Sair
        </button>
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <form
          onSubmit={launch}
          className="rounded-xl border border-white/10 bg-[#0c0c12] p-6 space-y-4 lg:col-span-1"
        >
          <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
            Lançar nota
          </div>

          <div>
            <div className="text-xs text-white/50 mb-1.5 font-mono">Time</div>
            <Select
              value={teamId}
              onValueChange={(v) => {
                setTeamId(v);
                setMemberId("");
              }}
            >
              <SelectTrigger className="w-full bg-white/[0.04] border-white/10">
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="text-xs text-white/50 mb-1.5 font-mono">Integrante</div>
            <Select value={memberId} onValueChange={setMemberId} disabled={!team}>
              <SelectTrigger className="w-full bg-white/[0.04] border-white/10">
                <SelectValue placeholder={team ? "Selecione…" : "Escolha um time primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {team?.members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-white/50 mb-1.5 font-mono">Pilar</div>
              <Select value={pillar} onValueChange={(v) => setPillar(v as PillarId)}>
                <SelectTrigger className="w-full bg-white/[0.04] border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["nlp", "vc", "am"] as PillarId[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PILLARS[p].shortName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1.5 font-mono">Etapa</div>
              <Select
                value={stage}
                onValueChange={(v) => setStage(v as StageId)}
              >
                <SelectTrigger className="w-full bg-white/[0.04] border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_ORDER.map((s) => {
                    const st = getStage(s);
                    return (
                      <SelectItem key={s} value={s}>
                        {st.order}. {st.title.replace(/^\d+\.\s*/, "")} ({STAGE_MAX_POINTS[s]} pts)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <label className="block">
            <div className="text-xs text-white/50 mb-1.5 font-mono">
              Pontos (0 — {STAGE_MAX_POINTS[stage]})
            </div>
            <input
              type="number"
              min={0}
              max={STAGE_MAX_POINTS[stage]}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full rounded-md bg-white/[0.04] border border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40 font-mono"
            />
          </label>

          <button
            type="submit"
            className="w-full px-4 py-2.5 rounded-md bg-white text-black text-sm hover:bg-white/90 transition-all"
          >
            Lançar nota
          </button>
        </form>

        <div className="lg:col-span-2 space-y-3">
          <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
            Times cadastrados
          </div>
          {ranks.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="rounded-xl border border-white/10 bg-[#0c0c12] p-5"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-display text-white">{t.name}</div>
                  <div className="text-xs text-white/50 mt-0.5">{t.tutor}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                      Grupo
                    </div>
                    <div className="font-display text-xl text-white">
                      {t.groupScore.toFixed(1)}
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmDelete(t.id)}
                    className="p-2 rounded-md border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/40 transition-colors"
                    aria-label="Excluir time"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {t.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-white/5 bg-white/[0.02] px-3 py-1.5"
                  >
                    <span className="text-sm text-white truncate">{m.name}</span>
                    <span className="font-mono text-sm text-violet-300">
                      {m.individualScore.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="max-w-sm w-full rounded-xl border border-white/10 bg-[#0c0c12] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-display text-lg text-white">Excluir time?</div>
            <p className="mt-2 text-sm text-white/60">
              Essa ação remove o time e todas as notas. Não pode ser desfeita.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-2 rounded-md border border-white/10 text-white/70 text-sm hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteTeam(confirmDelete);
                  toast.success("Time removido");
                  setConfirmDelete(null);
                }}
                className="px-3 py-2 rounded-md bg-red-500/90 hover:bg-red-500 text-white text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
