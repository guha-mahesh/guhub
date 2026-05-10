import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminProvider } from "./contexts/AdminContext";
import { CrenshawProvider } from "./contexts/CrenshawContext";
import TabNavigation from "./components/TabNavigation";
import Sidebar from "./components/Sidebar";
import BackgroundMusic from "./components/BackgroundMusic";
import AdminPasswordModal from "./components/AdminPasswordModal";
import AdminPanel from "./components/AdminPanel";
import CommandPalette from "./components/CommandPalette";
import Anteater from "./components/Anteater";
import BrainLanding from "./pages/BrainLanding";
import ProjectsTab from "./pages/ProjectsTab";
import AboutTab from "./pages/AboutTab";
import MusicLanding from "./pages/MusicLanding";
import TopTracks from "./pages/TopTracks";
import BlogPage from "./pages/BlogPage";
import QueuePage from "./pages/QueuePage";

function App() {
  return (
    <AdminProvider>
      <Router>
        <CrenshawProvider>
          <TabNavigation />
          <Sidebar />
          <BackgroundMusic />
          <AdminPasswordModal />
          <AdminPanel />
          <CommandPalette />
          <Anteater />
          <Routes>
            <Route path="/" element={<BrainLanding />} />
            <Route path="/projects" element={<ProjectsTab />} />
            <Route path="/about" element={<AboutTab />} />
            <Route path="/music" element={<MusicLanding />} />
            <Route path="/music/:id" element={<TopTracks />} />
            <Route path="/log" element={<BlogPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/listening" element={<QueuePage />} />
          </Routes>
        </CrenshawProvider>
      </Router>
    </AdminProvider>
  );
}

export default App;
