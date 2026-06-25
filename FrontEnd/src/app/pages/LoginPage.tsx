import { useState } from "react";
import { useNavigate } from "react-router";
import { useMemberSession } from "../lib/member-session";
import { toast } from "sonner";
import { KeyRound, ArrowRight } from "lucide-react";

export function LoginPage() {
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { identify } = useMemberSession();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error("Por favor, insira o codigo de acesso.");
      return;
    }

    setLoading(true);
    try {
      await identify(accessCode);
      toast.success("Identificacao realizada com sucesso!");
      navigate("/challenges");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Codigo de acesso invalido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="relative group rounded-2xl border border-white/5 bg-[#0b0b14] p-8 shadow-[0_0_30px_-5px_rgba(167,139,250,0.15)] transition-all">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 opacity-50 blur-xl group-hover:opacity-70 transition-opacity" />

        <div className="relative">
          <div className="mx-auto flex h-12 w-12 items-center justify-between rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 p-3 mb-6">
            <KeyRound className="w-6 h-6 mx-auto" />
          </div>

          <h1 className="text-2xl font-bold font-display text-center mb-2">
            Identificacao do Aluno
          </h1>
          <p className="text-sm text-white/60 text-center mb-8">
            Digite seu codigo de acesso de 6 caracteres para entrar na trilha e registrar suas pontuacoes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                Codigo de Acesso
              </label>
              <input
                id="code"
                type="text"
                maxLength={6}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase().trim())}
                placeholder="EX: AB7K9Q"
                className="w-full text-center tracking-widest text-lg font-mono px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all uppercase"
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-between px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-[0_0_20px_-5px_rgba(167,139,250,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              <span>{loading ? "Verificando..." : "Entrar na Trilha"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-white/40 border-t border-white/5 pt-6">
            <p>Nao sabe seu codigo? Solicite ao seu tutor do time na pagina de Times.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
