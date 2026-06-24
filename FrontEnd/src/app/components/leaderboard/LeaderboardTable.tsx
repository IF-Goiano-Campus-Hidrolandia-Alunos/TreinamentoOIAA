import { Fragment, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Crown, Medal, Search } from "lucide-react";
import { useTeams } from "../../lib/teams-store";
import type { SortOrder, TeamSortKey } from "../../lib/types";

const RANK_STYLES: Record<number, { ring: string; badge: string; icon?: typeof Crown }> = {
  1: { ring: "ring-yellow-300/60 shadow-[0_0_30px_-8px_rgba(253,224,71,0.7)]", badge: "bg-yellow-300/20 text-yellow-200 border-yellow-300/40", icon: Crown },
  2: { ring: "ring-zinc-300/40 shadow-[0_0_25px_-8px_rgba(228,228,231,0.5)]", badge: "bg-zinc-300/15 text-zinc-200 border-zinc-300/30", icon: Medal },
  3: { ring: "ring-amber-500/40 shadow-[0_0_25px_-8px_rgba(245,158,11,0.5)]", badge: "bg-amber-500/15 text-amber-200 border-amber-500/30", icon: Medal },
};

export function LeaderboardTable() {
  const { ranked } = useTeams();
  const [sortBy, setSortBy] = useState<TeamSortKey>("groupScore");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const data = useMemo(() => ranked({ sortBy, order }), [ranked, sortBy, order]);

  const filtered = data.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.tutor.toLowerCase().includes(q) ||
      t.members.some((m) => m.name.toLowerCase().includes(q))
    );
  });

  function toggleSort(key: TeamSortKey) {
    if (key === sortBy) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setOrder(key === "name" ? "asc" : "desc");
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function SortArrow({ active }: { active: boolean }) {
    if (!active) return <span className="opacity-30 text-xs">↕</span>;
    return order === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por time, tutor ou integrante…"
            className="w-full rounded-md bg-white/[0.04] border border-white/10 pl-10 pr-3 py-2 text-sm outline-none focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40"
          />
        </div>
        <div className="text-xs text-white/40 font-mono">
          {filtered.length} {filtered.length === 1 ? "time" : "times"}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0c0c12]">
        <table className="w-full text-sm" role="table">
          <thead className="text-left text-xs uppercase tracking-widest text-white/40 font-mono border-b border-white/10">
            <tr>
              <th className="px-4 py-3 w-12">#</th>
              <th className="px-4 py-3 w-8" />
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("name")} className="inline-flex items-center gap-1 hover:text-white">
                  Time <SortArrow active={sortBy === "name"} />
                </button>
              </th>
              <th className="px-4 py-3 hidden sm:table-cell">Tutor</th>
              <th className="px-4 py-3 text-right">
                <button onClick={() => toggleSort("groupScore")} className="inline-flex items-center gap-1 hover:text-white">
                  Nota do grupo <SortArrow active={sortBy === "groupScore"} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                  Nenhum time encontrado.
                </td>
              </tr>
            )}
            {filtered.map((t) => {
              const rs = RANK_STYLES[t.rank];
              const Icon = rs?.icon;
              const isOpen = expanded.has(t.id);
              return (
                <Fragment key={t.id}>
                  <tr
                    className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${rs ? rs.ring + " ring-1 ring-inset" : ""}`}
                  >
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border font-mono text-xs ${rs?.badge ?? "border-white/10 text-white/50"}`}>
                        {Icon ? <Icon className="w-3.5 h-3.5" /> : t.rank}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      <button
                        onClick={() => toggleExpand(t.id)}
                        className="text-white/50 hover:text-white"
                        aria-label="Expandir"
                      >
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleExpand(t.id)} className="text-left">
                        <div className="font-display text-white">{t.name}</div>
                        <div className="text-xs text-white/40 sm:hidden">{t.tutor}</div>
                      </button>
                    </td>
                    <td className="px-4 py-4 text-white/60 hidden sm:table-cell">{t.tutor}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden hidden md:block">
                          <div
                            className="h-full bg-gradient-to-r from-violet-400 to-cyan-300"
                            style={{ width: `${Math.min(100, t.groupScore)}%` }}
                          />
                        </div>
                        <span className="font-display text-xl text-white">{t.groupScore.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-black/40">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {t.members.length === 0 && (
                            <div className="text-xs text-white/40">Time sem integrantes.</div>
                          )}
                          {t.members.map((m) => (
                            <div
                              key={m.id}
                              className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <div className="text-sm text-white truncate">{m.name}</div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                                  {m.stagesCompleted}/15 etapas
                                </div>
                              </div>
                              <span className="font-mono text-violet-300">{m.individualScore.toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
