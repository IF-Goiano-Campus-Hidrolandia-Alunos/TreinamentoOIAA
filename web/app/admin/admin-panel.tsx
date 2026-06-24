"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shield, Award, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STAGE_MAX_POINTS } from "@/lib/stages";
import type { TeamRanked, PillarId, StageId } from "@/lib/types";

interface AdminPanelProps {
  initialTeams: TeamRanked[];
}

const STAGES: { id: StageId; name: string }[] = [
  { id: "theory", name: "1. Teoria (Max 10)" },
  { id: "guided", name: "2. Treino com Auxílio (Max 15)" },
  { id: "unguided", name: "3. Treino sem Auxílio (Max 20)" },
  { id: "fill-blanks", name: "4. Preencher Lacunas (Max 25)" },
  { id: "from-scratch", name: "5. IA do Zero (Max 30)" },
];

const PILLARS: { id: PillarId; name: string }[] = [
  { id: "nlp", name: "Processamento de Linguagem Natural (NLP)" },
  { id: "vc", name: "Visão Computacional (VC)" },
  { id: "am", name: "Aprendizado de Máquina (AM)" },
];

export function AdminPanel({ initialTeams }: AdminPanelProps) {
  const router = useRouter();
  const [token, setToken] = React.useState("");
  const [selectedTeamId, setSelectedTeamId] = React.useState("");
  const [selectedMemberId, setSelectedMemberId] = React.useState("");
  const [selectedPillar, setSelectedPillar] = React.useState<PillarId>("nlp");
  const [selectedStage, setSelectedStage] = React.useState<StageId>("theory");
  const [points, setPoints] = React.useState(0);

  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [deleteStatus, setDeleteStatus] = React.useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Carrega o token do localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("oiaa-admin-token") ?? "";
    setToken(saved);
  }, []);

  function handleTokenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setToken(val);
    localStorage.setItem("oiaa-admin-token", val);
  }

  // Encontra o time selecionado
  const selectedTeam = initialTeams.find((t) => t.id === selectedTeamId);

  // Limita os pontos com base no estágio selecionado
  const maxPoints = STAGE_MAX_POINTS[selectedStage];

  // Auto-seleciona primeiro integrante quando o time muda
  React.useEffect(() => {
    if (selectedTeam && selectedTeam.members.length > 0) {
      setSelectedMemberId(selectedTeam.members[0].id);
    } else {
      setSelectedMemberId("");
    }
  }, [selectedTeamId, selectedTeam]);

  async function handleScoreSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!token.trim()) {
      setStatus({ type: "err", msg: "Token de Admin é obrigatório para lançar notas." });
      return;
    }
    if (!selectedTeamId || !selectedMemberId) {
      setStatus({ type: "err", msg: "Selecione um time e um integrante." });
      return;
    }
    if (points < 0 || points > maxPoints) {
      setStatus({ type: "err", msg: `Pontuação inválida. O máximo para esta etapa é ${maxPoints} pts.` });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${selectedTeamId}/scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token.trim(),
        },
        body: JSON.stringify({
          memberId: selectedMemberId,
          pillar: selectedPillar,
          stage: selectedStage,
          points: Number(points),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "err", msg: data?.error ?? "Erro ao lançar nota." });
      } else {
        setStatus({ type: "ok", msg: "Nota lançada com sucesso!" });
        setPoints(0);
        router.refresh();
      }
    } catch {
      setStatus({ type: "err", msg: "Erro de rede ao lançar nota." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTeam(id: string, name: string) {
    setDeleteStatus(null);
    if (!token.trim()) {
      setDeleteStatus({ type: "err", msg: "Token de Admin é obrigatório para excluir um time." });
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir permanentemente o time "${name}" e todos os seus membros?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/teams/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": token.trim(),
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setDeleteStatus({ type: "err", msg: data?.error ?? "Erro ao excluir time." });
      } else {
        setDeleteStatus({ type: "ok", msg: `Time "${name}" excluído!` });
        if (selectedTeamId === id) setSelectedTeamId("");
        router.refresh();
      }
    } catch {
      setDeleteStatus({ type: "err", msg: "Erro de rede ao excluir time." });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Coluna Config e Formulário de Nota */}
      <div className="space-y-6 lg:col-span-1">
        {/* Token Card */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" /> Autorização
            </CardTitle>
            <CardDescription>
              Insira o token de segurança para autorizar as alterações no banco de dados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Token de Administrador (x-admin-token)
              </label>
              <Input
                type="password"
                value={token}
                onChange={handleTokenChange}
                placeholder="Insira o ADMIN_TOKEN..."
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                O token é salvo localmente no seu navegador para facilitar acessos futuros.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Form Nota */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Award className="h-5 w-5" /> Lançar Nota
            </CardTitle>
            <CardDescription>
              Atribua pontuação individual por integrante em uma etapa específica de um pilar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScoreSubmit} className="space-y-4">
              {/* Seleção do Time */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Time</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Selecione um time...</option>
                  {initialTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.tutor})
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção do Membro */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Integrante</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={!selectedTeamId}
                >
                  <option value="">Selecione um integrante...</option>
                  {selectedTeam?.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção do Pilar */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Pilar Acadêmico</label>
                <select
                  value={selectedPillar}
                  onChange={(e) => setSelectedPillar(e.target.value as PillarId)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  {PILLARS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção da Etapa */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Etapa do Desafio</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value as StageId)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pontos */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Pontos Obtidos</label>
                  <span className="text-[11px] font-semibold text-primary">
                    Máximo: {maxPoints} pontos
                  </span>
                </div>
                <Input
                  type="number"
                  min="0"
                  max={maxPoints}
                  step="0.5"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  required
                />
              </div>

              {/* Feedback de Status */}
              {status && (
                <div className={`flex items-center gap-2 rounded-md p-3 text-xs ${
                  status.type === "ok" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                }`}>
                  {status.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  <span>{status.msg}</span>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Gravando nota..." : "Lançar Nota"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Coluna Gerenciamento de Times */}
      <div className="lg:col-span-2">
        <Card className="h-full border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Gerenciar Times cadastrados</CardTitle>
            <CardDescription>
              Monitore o rendimento geral e remova times do banco de dados se necessário.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deleteStatus && (
              <div className={`flex items-center gap-2 rounded-md p-3 text-xs ${
                deleteStatus.type === "ok" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              }`}>
                {deleteStatus.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{deleteStatus.msg}</span>
              </div>
            )}

            <div className="space-y-4">
              {initialTeams.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col justify-between gap-4 rounded-lg border border-border/80 bg-background/30 p-4 transition-all hover:border-primary/20 md:flex-row md:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{t.name}</h4>
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        Grupo: {t.groupScore.toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Tutor responsável: {t.tutor}</p>
                    
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {t.members.map((m) => (
                        <div key={m.id} className="flex gap-2">
                          <span className="text-muted-foreground">{m.name}:</span>
                          <span className="font-mono font-semibold text-foreground">{m.score.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({m.completedStages}/15 etapas)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteTeam(t.id, t.name)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Excluir time ${t.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {initialTeams.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhum time cadastrado no sistema ainda.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
