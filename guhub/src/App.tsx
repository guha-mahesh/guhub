import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider } from "./contexts/AdminContext";
import { MetaProvider } from "./contexts/MetaContext";
import Noria from "./pages/Noria";
import BlogPage from "./pages/BlogPage";
import ListeningPage from "./pages/ListeningPage";

/**
 * The plate is the site. There is no tab bar and no chrome around it: you are
 * either standing in the engraving or you are on one of the two pages that are
 * only reachable by typing the directory. Everything else redirects home.
 */
function App() {
  return (
    <AdminProvider>
      <Router>
        <MetaProvider>
          <Routes>
            <Route path="/" element={<Noria />} />
            {/* unlisted: no tab points here, and nothing on the plate links to it */}
            <Route path="/log" element={<BlogPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/listening" element={<ListeningPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MetaProvider>
      </Router>
    </AdminProvider>
  );
}

export default App;
