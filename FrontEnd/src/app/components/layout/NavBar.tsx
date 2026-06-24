import { NavLink } from "react-router";
import { Brain, Code2, Home, ShieldCheck, Trophy, Users } from "lucide-react";
import capivara from "../../../imports/capivara.png";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/challenges", label: "Desafios", icon: Brain },
  { to: "/code", label: "Código", icon: Code2 },
  { to: "/teams", label: "Times", icon: Users },
  { to: "/leaderboard", label: "Placar", icon: Trophy },
  { to: "/admin", label: "Tutor", icon: ShieldCheck },
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07070b]/70 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src={capivara}
              alt="Capivara mascote"
              className="w-9 h-9 rounded-full ring-2 ring-violet-500/40 group-hover:ring-violet-400 transition-all object-cover float-slow"
            />
            <span className="absolute inset-0 rounded-full shadow-[0_0_15px_-2px_rgba(167,139,250,0.7)] pointer-events-none" />
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="font-display text-white">DESAFIO IA</div>
            <div className="text-[10px] tracking-widest text-white/40 uppercase">IF Goiano · Hidrolândia</div>
          </div>
        </NavLink>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all whitespace-nowrap",
                  isActive
                    ? "bg-white/5 text-white shadow-[0_0_20px_-8px_rgba(167,139,250,0.7)] ring-1 ring-violet-400/40"
                    : "text-white/60 hover:text-white hover:bg-white/5",
                ].join(" ")
              }
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
