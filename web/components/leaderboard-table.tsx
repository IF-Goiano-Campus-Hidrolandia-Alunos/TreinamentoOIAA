"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Search } from "lucide-react";
import type { SortOrder, TeamRanked, TeamSortKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MEDAL_TEXT = ["1º", "2º", "3º"];

export function LeaderboardTable({ initial }: { initial: TeamRanked[] }) {
  const [rows] = React.useState<TeamRanked[]>(initial);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<TeamSortKey>("groupScore");
  const [order, setOrder] = React.useState<SortOrder>("desc");
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  function toggleSort(key: TeamSortKey) {
    if (key === sortBy) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setOrder(key === "name" ? "asc" : "desc");
    }
  }

  const view = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let r = rows.filter(
      (t) =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.tutor.toLowerCase().includes(q) ||
        t.members.some((m) => m.name.toLowerCase().includes(q)),
    );
    const dir = order === "asc" ? 1 : -1;
    r = [...r].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
      const d = (a.groupScore - b.groupScore) * dir;
      return d !== 0 ? d : a.name.localeCompare(b.name);
    });
    return r;
  }, [rows, search, sortBy, order]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Filtrar por time, tutor ou integrante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>
                <SortBtn label="Time" active={sortBy === "name"} order={order} onClick={() => toggleSort("name")} />
              </TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead className="text-right">
                <SortBtn
                  label="Nota do Grupo"
                  active={sortBy === "groupScore"}
                  order={order}
                  reverse
                  onClick={() => toggleSort("groupScore")}
                />
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {view.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum time encontrado.
                </TableCell>
              </TableRow>
            ) : (
              view.map((t) => {
                const isOpen = open[t.id];
                return (
                  <React.Fragment key={t.id}>
                    <TableRow className="cursor-pointer" onClick={() => setOpen((o) => ({ ...o, [t.id]: !o[t.id] }))}>
                      <TableCell className="font-mono">
                        {t.position <= 3 ? (
                          <span className={cn(
                            "inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-bold",
                            t.position === 1 && "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30",
                            t.position === 2 && "bg-slate-400/20 text-slate-400 border border-slate-400/30",
                            t.position === 3 && "bg-amber-600/20 text-amber-500 border border-amber-600/30"
                          )}>
                            {MEDAL_TEXT[t.position - 1]}
                          </span>
                        ) : t.position}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{t.name}</TableCell>
                      <TableCell className="text-muted-foreground">{t.tutor}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{t.groupScore.toFixed(1)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow className="bg-muted/20 hover:bg-muted/20">
                        <TableCell />
                        <TableCell colSpan={4}>
                          <div className="space-y-1 py-1">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Notas individuais
                            </p>
                            {t.members.map((m) => (
                              <div key={m.id} className="flex items-center justify-between text-sm">
                                <span className="text-foreground">{m.name}</span>
                                <span className="flex items-center gap-3 text-muted-foreground">
                                  <span className="text-xs">{m.completedStages}/15 etapas</span>
                                  <span className="font-mono font-semibold text-foreground">
                                    {m.score.toFixed(1)}
                                  </span>
                                </span>
                              </div>
                            ))}
                            {t.members.length === 0 && (
                              <p className="text-sm text-muted-foreground">Sem integrantes.</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SortBtn({
  label,
  active,
  order,
  reverse,
  onClick,
}: {
  label: string;
  active: boolean;
  order: SortOrder;
  reverse?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 hover:text-foreground",
        reverse && "flex-row-reverse",
        active && "text-foreground",
      )}
    >
      {label}
      {active && (order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </button>
  );
}
