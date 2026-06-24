import { motion } from "motion/react";
import { useTeams } from "../lib/teams-store";
import { CreateTeamForm } from "../components/teams/CreateTeamForm";
import { TeamCard } from "../components/teams/TeamCard";

export function TeamsPage() {
  const { ranked } = useTeams();
  const teams = ranked({ sortBy: "createdAt", order: "desc" });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
        Times
      </div>
      <h1 className="font-display text-4xl text-white mt-2">
        Cadastre seu time e entre na disputa
      </h1>
      <p className="mt-3 text-white/60 max-w-2xl">
        Recomendamos 3 integrantes por time. O tutor é obrigatório, mas
        nunca conta na nota do grupo.
      </p>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CreateTeamForm />
        </div>
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {teams.length === 0 && (
            <div className="col-span-full text-center py-20 text-white/40 border border-dashed border-white/10 rounded-xl">
              Nenhum time cadastrado ainda. Seja o primeiro!
            </div>
          )}
          {teams.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <TeamCard team={t} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
