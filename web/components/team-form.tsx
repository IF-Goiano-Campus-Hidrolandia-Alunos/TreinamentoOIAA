"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MAX_MEMBERS = 5;

export function TeamForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [tutor, setTutor] = React.useState("");
  const [members, setMembers] = React.useState<string[]>(["", "", ""]);
  const [status, setStatus] = React.useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [loading, setLoading] = React.useState(false);

  function setMember(i: number, v: string) {
    setMembers((m) => m.map((x, idx) => (idx === i ? v : x)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const cleanMembers = members.map((m) => m.trim()).filter(Boolean);
    if (!name.trim() || !tutor.trim() || cleanMembers.length === 0) {
      setStatus({ type: "err", msg: "Preencha nome do time, tutor e ao menos 1 integrante." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), tutor: tutor.trim(), members: cleanMembers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "err", msg: data?.error ?? "Erro ao criar o time." });
      } else {
        setStatus({ type: "ok", msg: `Time "${data.team.name}" criado!` });
        setName("");
        setTutor("");
        setMembers(["", "", ""]);
        router.refresh();
      }
    } catch {
      setStatus({ type: "err", msg: "Falha de rede ao criar o time." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Criar um time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome do time</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Os Visionarios" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tutor (nao conta na media)</label>
              <Input value={tutor} onChange={(e) => setTutor(e.target.value)} placeholder="Ex.: Prof. Marcos" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Integrantes</label>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={m}
                    onChange={(e) => setMember(i, e.target.value)}
                    placeholder={`Integrante ${i + 1}`}
                  />
                  {members.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setMembers((arr) => arr.filter((_, idx) => idx !== i))}
                      aria-label="Remover integrante"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {members.length < MAX_MEMBERS && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setMembers((arr) => [...arr, ""])}
              >
                <Plus className="h-4 w-4" /> Adicionar integrante
              </Button>
            )}
          </div>

          {status && (
            <p className={status.type === "ok" ? "text-sm text-am" : "text-sm text-red-400"}>{status.msg}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar time"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
