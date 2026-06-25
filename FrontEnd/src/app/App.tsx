import { HashRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { NavBar } from "./components/layout/NavBar";
import { Footer } from "./components/layout/Footer";
import { TeamsProvider } from "./lib/teams-store";
import { MemberSessionProvider } from "./lib/member-session";
import { HomePage } from "./pages/HomePage";
import { ChallengesPage } from "./pages/ChallengesPage";
import { PillarTrailPage } from "./pages/PillarTrailPage";
import { StageDetailPage } from "./pages/StageDetailPage";
import { CodePage } from "./pages/CodePage";
import { TeamsPage } from "./pages/TeamsPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { AdminPage } from "./pages/AdminPage";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
  return (
    <div className="dark min-h-screen bg-[#07070b] text-white">
      <TeamsProvider>
        <MemberSessionProvider>
          <HashRouter>
            <NavBar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/entrar" element={<LoginPage />} />
                <Route path="/challenges" element={<ChallengesPage />} />
                <Route path="/challenges/:pillar" element={<PillarTrailPage />} />
                <Route path="/challenges/:pillar/:stage" element={<StageDetailPage />} />
                <Route path="/code" element={<CodePage />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
          </HashRouter>
          <Toaster theme="dark" position="bottom-right" richColors />
        </MemberSessionProvider>
      </TeamsProvider>
    </div>
  );
}
