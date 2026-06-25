import { useEffect, useMemo, useState } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Users, 
  Award, 
  FileDown, 
  Search, 
  Copy, 
  RefreshCw, 
  Key, 
  LayoutDashboard, 
  History, 
  PlusSquare,
  ClipboardCheck,
  UploadCloud,
  FileCheck2
} from "lucide-react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TOKEN_KEY = "ifg-admin-token";
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const api = (path: string) => `${API_BASE}${path}`;

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
      toast.error("Token invalido");
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
            <ShieldAlert className="w-3.5 h-3.5" /> Area restrita
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
              className="w-full px-4 py-2.5 rounded-md bg-white text-black text-sm hover:bg-white/90 transition-all cursor-pointer"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={logout} adminToken={token} />;
}

interface Submission {
  id: string;
  memberId: string;
  memberName: string;
  teamId: string;
  teamName: string;
  pillar: string;
  stage: string;
  points: number;
  detail: any;
  createdAt: string;
}

function AdminDashboard({ onLogout, adminToken }: { onLogout: () => void; adminToken: string }) {
  const { teams, ranked, submitScore, deleteTeam, refreshFromApi, mode } = useTeams();
  const ranks = ranked({ sortBy: "groupScore", order: "desc" });

  const [activeTab, setActiveTab] = useState<
    "overview" | "teams" | "submissions" | "override" | "answerkeys"
  >("overview");

  const [teamId, setTeamId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [pillar, setPillar] = useState<PillarId>("nlp");
  const [stage, setStage] = useState<StageId>("theory");
  const [points, setPoints] = useState<number>(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Submissoes log state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [backfilling, setBackfilling] = useState(false);

  // Gabaritos (CSV auto-scorer)
  type AnswerKeyStatus = { pillar: string; stage: string; metric: string; count: number; updatedAt: string };
  const [answerKeys, setAnswerKeys] = useState<AnswerKeyStatus[]>([]);
  const [akPillar, setAkPillar] = useState<PillarId>("vc");
  const [akStage, setAkStage] = useState<StageId>("fill-blanks");
  const [akUploading, setAkUploading] = useState(false);

  const team = useMemo(() => teams.find((t) => t.id === teamId), [teams, teamId]);

  async function loadAnswerKeys() {
    if (mode !== "api") return;
    try {
      const r = await fetch(api("/api/admin/answer-key"), {
        headers: { "x-admin-token": ADMIN_TOKEN_DEMO },
      });
      if (r.ok) {
        const d = (await r.json()) as { keys: AnswerKeyStatus[] };
        setAnswerKeys(d.keys || []);
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (activeTab === "answerkeys") loadAnswerKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, mode]);

  const handleAnswerKeyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (mode !== "api") {
      toast.error("Cadastro de gabarito disponivel apenas no modo API (com backend).");
      return;
    }
    setAkUploading(true);
    try {
      const csv = await file.text();
      const res = await fetch(api("/api/admin/answer-key"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN_DEMO },
        body: JSON.stringify({ pillar: akPillar, stage: akStage, csv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao salvar o gabarito.");
      toast.success(`Gabarito salvo: ${data.count} linhas (metrica: ${data.metric}).`);
      await loadAnswerKeys();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao enviar o gabarito.");
    } finally {
      setAkUploading(false);
    }
  };

  // Carregar submissoes se estiver na aba correspondente
  useEffect(() => {
    if (activeTab !== "submissions") return;

    if (mode === "api") {
      setLoadingSubmissions(true);
      fetch(api("/api/admin/submissions"), {
        headers: { "x-admin-token": ADMIN_TOKEN_DEMO },
      })
        .then((r) => {
          if (!r.ok) throw new Error("Falha ao buscar logs");
          return r.json();
        })
        .then((data: { submissions: Submission[] }) => {
          setSubmissions(data.submissions || []);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Nao foi possivel carregar o historico do servidor.");
        })
        .finally(() => {
          setLoadingSubmissions(false);
        });
    } else {
      // Mock local submissions
      setSubmissions([
        {
          id: "sub_1",
          memberId: "m1",
          memberName: "Ana Beatriz",
          teamId: "t1",
          teamName: "Capivaras Quanticas",
          pillar: "nlp",
          stage: "theory",
          points: 10,
          detail: { correctCount: 3, totalQuestions: 3 },
          createdAt: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: "sub_2",
          memberId: "m2",
          memberName: "Pedro Cardoso",
          teamId: "t2",
          teamName: "Neuronios do Cerrado",
          pillar: "vc",
          stage: "guided",
          points: 15,
          detail: { correctCount: 2, totalQuestions: 2 },
          createdAt: new Date(Date.now() - 1200000).toISOString(),
        },
        {
          id: "sub_3",
          memberId: "m3",
          memberName: "Marina Pires",
          teamId: "t3",
          teamName: "GPT do Goias",
          pillar: "am",
          stage: "fill-blanks",
          points: 20,
          detail: { value: 0.98 },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    }
  }, [activeTab, mode]);

  // KPIs
  const totalTeams = teams.length;
  const totalMembers = useMemo(() => teams.reduce((acc, t) => acc + t.members.length, 0), [teams]);
  const generalAverage = useMemo(() => {
    if (ranks.length === 0) return 0;
    const sum = ranks.reduce((acc, r) => acc + r.groupScore, 0);
    return Math.round((sum / ranks.length) * 10) / 10;
  }, [ranks]);

  // Preparar dados do grafico por pilar
  const pillarChartData = useMemo(() => {
    const pSums = { nlp: 0, vc: 0, am: 0 };
    let count = 0;
    teams.forEach((t) => {
      t.members.forEach((m) => {
        count++;
        (m.scores || []).forEach((s) => {
          pSums[s.pillar] += s.points;
        });
      });
    });

    const divisor = count || 1;
    return [
      { name: "NLP", media: Math.round((pSums.nlp / divisor) * 10) / 10, fill: "#8b5cf6" },
      { name: "VC", media: Math.round((pSums.vc / divisor) * 10) / 10, fill: "#06b6d4" },
      { name: "AM", media: Math.round((pSums.am / divisor) * 10) / 10, fill: "#10b981" },
    ];
  }, [teams]);

  // Preparar dados do grafico de conclusao por estagio
  const stageChartData = useMemo(() => {
    const sCounts = {
      theory: 0,
      guided: 0,
      unguided: 0,
      "fill-blanks": 0,
      "from-scratch": 0,
    };
    teams.forEach((t) => {
      t.members.forEach((m) => {
        (m.scores || []).forEach((s) => {
          if (s.points > 0) {
            sCounts[s.stage]++;
          }
        });
      });
    });

    return [
      { name: "Teoria", concluido: sCounts.theory },
      { name: "Guiado", concluido: sCounts.guided },
      { name: "Sem Auxilio", concluido: sCounts.unguided },
      { name: "Lacunas", concluido: sCounts["fill-blanks"] },
      { name: "Do Zero", concluido: sCounts["from-scratch"] },
    ];
  }, [teams]);

  // Executar backfill de codigos de acesso
  const handleBackfill = async () => {
    if (mode !== "api") {
      toast.error("O backfill de codigos so e disponivel no modo API.");
      return;
    }

    setBackfilling(true);
    try {
      const res = await fetch(api("/api/admin/backfill-codes"), {
        method: "POST",
        headers: { "x-admin-token": ADMIN_TOKEN_DEMO },
      });

      if (!res.ok) {
        throw new Error("Erro na chamada de backfill.");
      }

      const data = await res.json() as { backfilledCount: number };
      toast.success(`Backfill concluido! Codigos gerados para ${data.backfilledCount} integrantes.`);
      await refreshFromApi();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao executar backfill.");
    } finally {
      setBackfilling(false);
    }
  };

  // Exportar notas consolidadas em CSV
  const handleExportCSV = () => {
    const headers = [
      "Time",
      "Tutor",
      "Aluno",
      "NLP_Teoria", "NLP_Guiado", "NLP_SemAuxilio", "NLP_Lacunas", "NLP_DoZero",
      "VC_Teoria", "VC_Guiado", "VC_SemAuxilio", "VC_Lacunas", "VC_DoZero",
      "AM_Teoria", "AM_Guiado", "AM_SemAuxilio", "AM_Lacunas", "AM_DoZero",
      "Nota_Total",
    ];

    const rows: string[][] = [];
    teams.forEach((t) => {
      t.members.forEach((m) => {
        const getPoints = (p: string, s: string) => {
          const found = m.scores.find((x) => x.pillar === p && x.stage === s);
          return found ? found.points : 0;
        };

        const totalPoints = m.scores.reduce((sum, s) => sum + s.points, 0);
        const normalized = Math.round((totalPoints / 300) * 100 * 10) / 10;

        const row = [
          t.name,
          t.tutor,
          m.name,
          String(getPoints("nlp", "theory")),
          String(getPoints("nlp", "guided")),
          String(getPoints("nlp", "unguided")),
          String(getPoints("nlp", "fill-blanks")),
          String(getPoints("nlp", "from-scratch")),
          String(getPoints("vc", "theory")),
          String(getPoints("vc", "guided")),
          String(getPoints("vc", "unguided")),
          String(getPoints("vc", "fill-blanks")),
          String(getPoints("vc", "from-scratch")),
          String(getPoints("am", "theory")),
          String(getPoints("am", "guided")),
          String(getPoints("am", "unguided")),
          String(getPoints("am", "fill-blanks")),
          String(getPoints("am", "from-scratch")),
          String(normalized),
        ];
        rows.push(row);
      });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "notas_desafio_ia.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exportado com sucesso!");
  };

  const handleCopyCode = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success(`Codigo ${code} copiado!`);
  };

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
    toast.success("Nota manual lancada com override");
    setPoints(0);
  }

  // Filtrar submissoes por query de busca
  const filteredSubmissions = submissions.filter((sub) => {
    const q = searchQuery.toLowerCase();
    return (
      sub.memberName.toLowerCase().includes(q) ||
      sub.teamName.toLowerCase().includes(q) ||
      sub.pillar.toLowerCase().includes(q) ||
      sub.stage.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" /> Tutor Autenticado
          </div>
          <h1 className="font-display text-4xl font-bold text-white mt-2">Painel do Tutor</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all cursor-pointer font-medium"
          >
            <FileDown className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          {mode === "api" && (
            <button
              onClick={handleBackfill}
              disabled={backfilling}
              className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg border border-violet-500/30 bg-violet-600/10 text-violet-300 hover:bg-violet-600/20 transition-all disabled:opacity-50 cursor-pointer font-medium"
            >
              <Key className="w-4 h-4" />
              <span>{backfilling ? "Gerando..." : "Gerar Codigos Antigos"}</span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="text-xs px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer font-medium"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-white/5 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === "overview"
              ? "border-violet-500 text-white font-medium"
              : "border-transparent text-white/50 hover:text-white hover:border-white/10"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Visao Geral</span>
        </button>
        <button
          onClick={() => setActiveTab("teams")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === "teams"
              ? "border-violet-500 text-white font-medium"
              : "border-transparent text-white/50 hover:text-white hover:border-white/10"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Times e Codigos</span>
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === "submissions"
              ? "border-violet-500 text-white font-medium"
              : "border-transparent text-white/50 hover:text-white hover:border-white/10"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historico de Submissoes</span>
        </button>
        <button
          onClick={() => setActiveTab("override")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === "override"
              ? "border-violet-500 text-white font-medium"
              : "border-transparent text-white/50 hover:text-white hover:border-white/10"
          }`}
        >
          <PlusSquare className="w-4 h-4" />
          <span>Lancar Notas</span>
        </button>
        <button
          onClick={() => setActiveTab("answerkeys")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === "answerkeys"
              ? "border-violet-500 text-white font-medium"
              : "border-transparent text-white/50 hover:text-white hover:border-white/10"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Gabaritos (Auto-correcao)</span>
        </button>
      </div>

      <div className="mt-8">
        {/* TAB 1: VISÃO GERAL (GRÁFICOS) */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-xl border border-white/5 bg-[#0b0b14] p-6 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
                  <Users className="w-16 h-16" />
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-white/40">Total de Times</div>
                <div className="text-3xl font-bold font-display text-white">{totalTeams}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0b0b14] p-6 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
                  <Users className="w-16 h-16" />
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-white/40">Total de Alunos</div>
                <div className="text-3xl font-bold font-display text-white">{totalMembers}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0b0b14] p-6 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
                  <Award className="w-16 h-16" />
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-white/40">Media Geral das Notas</div>
                <div className="text-3xl font-bold font-display text-violet-400">{generalAverage} <span className="text-xs text-white/40">/ 100</span></div>
              </div>
            </div>

            {/* Graficos */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-6 space-y-4">
                <h3 className="text-sm font-mono uppercase tracking-widest text-white/70">Media de Pontos por Pilar</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pillarChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                        labelStyle={{ color: "#fff", fontWeight: "bold" }}
                      />
                      <Bar dataKey="media" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-6 space-y-4">
                <h3 className="text-sm font-mono uppercase tracking-widest text-white/70">Alunos Concluintes por Etapa</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stageChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                        labelStyle={{ color: "#fff", fontWeight: "bold" }}
                      />
                      <Bar dataKey="concluido" fill="#c084fc" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIMES E CÓDIGOS DE ACESSO */}
        {activeTab === "teams" && (
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
              Listagem de Times e Integrantes
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
                    <h3 className="font-display text-lg text-white font-bold">{t.name}</h3>
                    <div className="text-xs text-white/40 mt-0.5">Tutor: {t.tutor}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                        Pontuacao Grupo
                      </div>
                      <div className="font-display text-xl text-white font-bold">
                        {t.groupScore.toFixed(1)}
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirmDelete(t.id)}
                      className="p-2 rounded-md border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/40 transition-colors cursor-pointer"
                      aria-label="Excluir time"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {t.members.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/[0.01] p-3 hover:bg-white/[0.03] transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white truncate">{m.name}</span>
                        <span className="font-mono text-sm text-violet-300 font-bold">
                          {m.individualScore.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                        <span className="text-[10px] uppercase tracking-wider text-white/30 font-mono">Codigo de Acesso</span>
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs font-mono bg-violet-950/40 border border-violet-850/50 text-violet-300 px-2 py-0.5 rounded">
                            {m.accessCode || "SEM CODIGO"}
                          </code>
                          {m.accessCode && (
                            <button
                              onClick={() => handleCopyCode(m.accessCode)}
                              className="text-white/40 hover:text-white transition-colors p-1"
                              title="Copiar codigo"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* TAB 3: HISTÓRICO DE SUBMISSÕES */}
        {activeTab === "submissions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
                Log de Envios Recentes
              </div>
              <div className="relative w-64 max-w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Buscar aluno, time ou etapa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {loadingSubmissions ? (
              <div className="rounded-xl border border-white/5 bg-[#0b0b14] p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-violet-400 mx-auto mb-2" />
                <span className="text-sm text-white/40">Buscando logs de submissao...</span>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-[#0b0b14] p-8 text-center text-white/40 text-sm">
                Nenhuma submissao encontrada.
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#0c0c12] overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-white/60 font-mono uppercase tracking-wider text-[10px]">
                      <th className="p-3">Data</th>
                      <th className="p-3">Aluno</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Desafio</th>
                      <th className="p-3">Etapa</th>
                      <th className="p-3 text-right">Pontos</th>
                      <th className="p-3">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((sub) => {
                      const dt = new Date(sub.createdAt).toLocaleString("pt-BR");
                      return (
                        <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                          <td className="p-3 text-white/50 whitespace-nowrap font-mono">{dt}</td>
                          <td className="p-3 font-semibold text-white">{sub.memberName}</td>
                          <td className="p-3 text-white/80">{sub.teamName}</td>
                          <td className="p-3 font-mono text-violet-400 uppercase">{sub.pillar}</td>
                          <td className="p-3 font-mono text-white/70">{sub.stage}</td>
                          <td className="p-3 text-right font-bold text-white">{sub.points}</td>
                          <td className="p-3 text-white/40 font-mono truncate max-w-xs" title={JSON.stringify(sub.detail)}>
                            {JSON.stringify(sub.detail)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LANÇAR NOTAS (MANUAL OVERRIDE) */}
        {activeTab === "override" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <form
              onSubmit={launch}
              className="rounded-xl border border-white/10 bg-[#0c0c12] p-6 space-y-4 lg:col-span-1"
            >
              <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
                Lancar Nota (Override Manual)
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
                    <SelectValue placeholder="Selecione..." />
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
                    <SelectValue placeholder={team ? "Selecione..." : "Escolha um time primeiro"} />
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
                  Pontos (0 - {STAGE_MAX_POINTS[stage]})
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
                className="w-full px-4 py-2.5 rounded-md bg-white text-black text-sm hover:bg-white/90 transition-all cursor-pointer font-medium"
              >
                Lancar nota
              </button>
            </form>

            <div className="lg:col-span-2 space-y-3">
              <div className="rounded-xl border border-white/5 bg-[#0b0b14] p-5 text-sm text-white/60 space-y-2">
                <div className="font-semibold text-white uppercase tracking-wider text-[10px]">Aviso sobre Lançamento Manual</div>
                <p>
                  O lancamento manual serve para override de notas (correcoes manuais, avaliacoes especificas, bonificacoes).
                  Ele substitui a pontuacao atual daquela etapa/pilar no perfil do integrante.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GABARITOS (CSV AUTO-SCORER) */}
        {activeTab === "answerkeys" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/10 bg-[#0c0c12] p-6 space-y-4 lg:col-span-1">
              <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
                Cadastrar gabarito (CSV)
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Envie o CSV de respostas verdadeiras (colunas{" "}
                <span className="font-mono text-white/70">id,valor</span>). O aluno envia as previsoes
                e o servidor calcula a metrica automaticamente. Metrica: VC/NLP = acuracia, AM = RMSE.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-white/50 mb-1.5 font-mono">Pilar</div>
                  <Select value={akPillar} onValueChange={(v) => setAkPillar(v as PillarId)}>
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
                  <Select value={akStage} onValueChange={(v) => setAkStage(v as StageId)}>
                    <SelectTrigger className="w-full bg-white/[0.04] border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["fill-blanks", "from-scratch"] as StageId[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          {getStage(s).title.replace(/^\d+\.\s*/, "")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <label
                className={`flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-violet-500/40 bg-violet-600/5 text-sm text-white cursor-pointer hover:bg-violet-600/10 transition-all ${
                  akUploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>{akUploading ? "Enviando gabarito..." : "Selecionar CSV do gabarito"}</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleAnswerKeyUpload}
                  disabled={akUploading}
                />
              </label>
              {mode !== "api" && (
                <p className="text-[11px] text-amber-400">
                  Disponivel apenas com backend (modo API).
                </p>
              )}
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
                Gabaritos cadastrados
              </div>
              {answerKeys.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-[#0b0b14] p-8 text-center text-white/40 text-sm">
                  Nenhum gabarito cadastrado ainda.
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-[#0c0c12] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-white/60 font-mono uppercase tracking-wider text-[10px]">
                        <th className="p-3">Pilar</th>
                        <th className="p-3">Etapa</th>
                        <th className="p-3">Metrica</th>
                        <th className="p-3 text-right">Linhas</th>
                        <th className="p-3">Atualizado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {answerKeys.map((k) => (
                        <tr key={`${k.pillar}-${k.stage}`} className="border-b border-white/5">
                          <td className="p-3 font-mono text-violet-400 uppercase">{k.pillar}</td>
                          <td className="p-3 font-mono text-white/70">{k.stage}</td>
                          <td className="p-3 text-white/80">{k.metric}</td>
                          <td className="p-3 text-right font-bold text-white">{k.count}</td>
                          <td className="p-3 text-white/40 font-mono whitespace-nowrap">
                            {new Date(k.updatedAt).toLocaleString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="max-w-sm w-full rounded-xl border border-white/10 bg-[#0c0c12] p-6 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-display text-lg text-white font-bold">Excluir time?</div>
            <p className="mt-2 text-sm text-white/60">
              Essa acao remove o time e todas as notas de todos os integrantes. Nao pode ser desfeita.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-2 rounded-md border border-white/10 text-white/70 text-sm hover:bg-white/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteTeam(confirmDelete);
                  toast.success("Time removido");
                  setConfirmDelete(null);
                }}
                className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm cursor-pointer font-medium"
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

// Sub-componente Loader simplificado
function Loader2({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
