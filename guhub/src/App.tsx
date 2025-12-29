import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TabNavigation from "./components/TabNavigation";
import Sidebar from "./components/Sidebar";
import BrainLanding from "./pages/BrainLanding";
import ProjectsTab from "./pages/ProjectsTab";
import AboutTab from "./pages/AboutTab";

function App() {
  return (
    <>
      <Router>
        <TabNavigation />
        <Sidebar />
        <Routes>
          <Route path="/" element={<BrainLanding />} />
          <Route path="/projects" element={<ProjectsTab />} />
          <Route path="/about" element={<AboutTab />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
