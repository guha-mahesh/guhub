import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminProvider } from "./contexts/AdminContext";
import { CrenshawProvider } from "./contexts/CrenshawContext";
import { MetaProvider } from "./contexts/MetaContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import TabNavigation from "./components/TabNavigation";
import Sidebar from "./components/Sidebar";
import BackgroundMusic from "./components/BackgroundMusic";
import AdminPasswordModal from "./components/AdminPasswordModal";
import AdminPanel from "./components/AdminPanel";
import CommandPalette from "./components/CommandPalette";
import Anteater from "./components/Anteater";
import MetaCrenshawRpg from "./components/MetaCrenshawRpg";
import MetaNpcs, { InventoryBar } from "./components/MetaNpcs";
import SiteBackdrop from "./components/SiteBackdrop";
import CasperSpeaks from "./components/CasperSpeaks";
import CrenshawShadow from "./components/CrenshawShadow";
import MiuPuzzle from "./components/MiuPuzzle";
import ResetCrenshawModal from "./components/ResetCrenshawModal";
import CrenshawExplainer from "./components/CrenshawExplainer";
import CrenshawOptInButton from "./components/CrenshawOptInButton";
import BrainLanding from "./pages/BrainLanding";
import ProjectsTab from "./pages/ProjectsTab";
import AboutTab from "./pages/AboutTab";
import MusicLanding from "./pages/MusicLanding";
import TopTracks from "./pages/TopTracks";
import BlogPage from "./pages/BlogPage";
import ListeningPage from "./pages/ListeningPage";
import ViewDeck from "./pages/ViewDeck";
import Noria from "./pages/Noria";

function App() {
  return (
    <AdminProvider>
      <Router>
        <MetaProvider>
        <InventoryProvider>
        <CrenshawProvider>
          <SiteBackdrop />
          <div className="appChrome">
            <TabNavigation />
            <Sidebar />
            <BackgroundMusic />
            <AdminPasswordModal />
            <AdminPanel />
            <CommandPalette />
            <Anteater />
            <MetaCrenshawRpg />
            <MetaNpcs />
            <InventoryBar />
            <CasperSpeaks />
            <CrenshawShadow />
            <MiuPuzzle />
            <ResetCrenshawModal />
            <CrenshawExplainer />
            <CrenshawOptInButton />
            <Routes>
              <Route path="/" element={<BrainLanding />} />
              <Route path="/projects" element={<ProjectsTab />} />
              <Route path="/about" element={<AboutTab />} />
              <Route path="/music" element={<MusicLanding />} />
              <Route path="/music/:id" element={<TopTracks />} />
              <Route path="/log" element={<BlogPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/listening" element={<ListeningPage />} />
              <Route path="/aquarium" element={<ViewDeck />} />
              <Route path="/view_deck" element={<ViewDeck />} />
              <Route path="/noria" element={<Noria />} />
            </Routes>
          </div>
        </CrenshawProvider>
        </InventoryProvider>
        </MetaProvider>
      </Router>
    </AdminProvider>
  );
}

export default App;
