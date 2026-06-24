import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useTeams } from "../../lib/teams-store";

export function CreateTeamForm() {
  const { createTeam } = useTeams();
  const [name, setName] = useState("");
  const [tutor, setTutor] = useState("");
  const [members, setMembers] = useState<string[]>(["", "", ""]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !tutor.trim()) {
      toast.error("Preencha nome do time e tutor");
      return;
    }
    const cleaned = members.map((m) => m.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      toast.error("Adicione ao menos 1 integrante");
      return;
    }
    createTeam({ name, tutor, members: cleaned });
    toast.success(`Time "${name}" criado`);
    setName("");
    setTutor("");
    setMembers(["", "", ""]);
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-white/10 bg-[#0c0c12] p-6 space-y-4"
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 font-mono">
        <Users className="w-3.5 h-3.5" /> Cadastrar novo time
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <div className="text-xs text-white/50 mb-1.5 font-mono">Nome do time</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Capivaras Quânticas"
            className="w-full rounded-md bg-white/[0.04] border border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40"
          />
        </label>
        <label className="block">
          <div className="text-xs text-white/50 mb-1.5 font-mono">Tutor responsável</div>
          <input
            value={tutor}
            onChange={(e) => setTutor(e.target.value)}
            placeholder="ex: Prof. Thyago"
            className="w-full rounded-md bg-white/[0.04] border border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40"
          />
        </label>
      </div>

      <div>
        <div className="text-xs text-white/50 mb-1.5 font-mono">Integrantes</div>
        <div className="space-y-2">
          {members.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={m}
                onChange={(e) =>
                  setMembers((prev) =>
                    prev.map((v, idx) => (idx === i ? e.target.value : v))
                  )
                }
                placeholder={`Integrante ${i + 1}`}
                className="flex-1 rounded-md bg-white/[0.04] border border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40"
              />
              {members.length > 1 && (
                <button
                  type="button"
                  onClick={() => setMembers((prev) => prev.filter((_, idx) => idx !== i))}
                  className="px-3 rounded-md border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/40 transition-colors"
                  aria-label="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMembers((prev) => [...prev, ""])}
          className="mt-2 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar integrante
        </button>
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-white text-black text-sm hover:bg-white/90 transition-all"
      >
        Criar time
      </button>
    </form>
  );
}
