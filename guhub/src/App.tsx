import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminProvider } from "./contexts/AdminContext";
import TabNavigation from "./components/TabNavigation";
import Sidebar from "./components/Sidebar";
import BackgroundMusic from "./components/BackgroundMusic";
import AdminPasswordModal from "./components/AdminPasswordModal";
import AdminPanel from "./components/AdminPanel";
import CommandPalette from "./components/CommandPalette";
import BrainLanding from "./pages/BrainLanding";
import ProjectsTab from "./pages/ProjectsTab";
import AboutTab from "./pages/AboutTab";
import MusicLanding from "./pages/MusicLanding";
import TopTracks from "./pages/TopTracks";
import PhilosophyLanding from "./pages/PhilosophyLanding";
import CultureLanding from "./pages/CultureLanding";
import GeographyLanding from "./pages/GeographyLanding";
import AnimalsLanding from "./pages/AnimalsLanding";
import BlogPage from "./pages/BlogPage";
import MusicPage from "./pages/MusicPage";
import QueuePage from "./pages/QueuePage";

function App() {
  return (
    <AdminProvider>
      <Router>
        <TabNavigation />
        <Sidebar />
        <BackgroundMusic />
        <AdminPasswordModal />
        <AdminPanel />
        <CommandPalette />
        <Routes>
          <Route path="/" element={<BrainLanding />} />
          <Route path="/projects" element={<ProjectsTab />} />
          <Route path="/about" element={<AboutTab />} />
          <Route path="/music" element={<MusicLanding />} />
          <Route path="/music/:id" element={<TopTracks />} />
          <Route path="/philosophy" element={<PhilosophyLanding />} />
          <Route path="/culture" element={<CultureLanding />} />
          <Route path="/geography" element={<GeographyLanding />} />
          <Route path="/animals" element={<AnimalsLanding />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/listening" element={<QueuePage />} />
          <Route path="/music" element={<MusicPage />} />
        </Routes>
      </Router>
    </AdminProvider>
  );
}

export default App;
