import { useState, useEffect } from 'react';
import BrainGraph from '../components/BrainGraph';
import GalaxySelector from '../components/GalaxySelector';
import { FaGithub, FaLinkedin, FaDownload, FaLaptop } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import type { GalaxyType } from '../data/galaxyData';
import './BrainLanding.css';

const BrainLanding = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyType | null>(null);

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileDevice =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleResumeDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = '/GuhaMaheshResumé.pdf';
    link.download = 'GuhaMaheshResumé.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isMobile) {
    return (
      <div className="mobileFallback">
        <div className="mobileContent">
          <h1 className="mobileTitle">Guha Mahesh</h1>
          <div className="mobileLaptopIcon">
            <FaLaptop />
          </div>
          <p className="mobileMessage">
            For the full interactive experience, please open this site on a laptop or desktop computer.
          </p>

          <div className="mobileLinks">
            <Link to="/about" className="mobileNavButton">
              View Resume & Info
            </Link>
            <Link to="/projects" className="mobileNavButton">
              View Projects
            </Link>
          </div>

          <div className="mobileSocial">
            <a
              href="https://github.com/guha-mahesh"
              target="_blank"
              rel="noopener noreferrer"
              className="mobileSocialButton"
            >
              <FaGithub />
            </a>
            <a
              href="https://linkedin.com/in/guhamahesh"
              target="_blank"
              rel="noopener noreferrer"
              className="mobileSocialButton"
            >
              <FaLinkedin />
            </a>
            <a href="/GuhaMaheshResumé.pdf" onClick={handleResumeDownload} className="mobileSocialButton">
              <FaDownload />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="brainLanding">
      {/* Hero Landing Section */}
      <section className="heroSection">
        <div className="heroGrid">
          <div className="heroMain">
            <div className="nameBlock">
              <span className="nameFirst">GUHA</span>
              <span className="nameLast">MAHESH</span>
            </div>

            <div className="roleStack">
              <div className="roleItem">
                <span className="roleLabel">[current]</span>
                <span className="roleText">Human Memory AI Systems</span>
                <span className="roleCompany">@ Memory Machines</span>
                <span className="roleNote">(Harvard AI spinout)</span>
              </div>
              <div className="roleItem">
                <span className="roleLabel">[studying]</span>
                <span className="roleText">Data Science + FinTech</span>
                <span className="roleCompany">@ Northeastern</span>
              </div>
            </div>

            <div className="interestsGrid">
              <span className="interestTag">ML/AI</span>
              <span className="interestTag">ethics</span>
              <span className="interestTag">culture</span>
              <span className="interestTag">geography</span>
              <span className="interestTag">sound</span>
            </div>

            <Link to="/about" className="realTalkButton">
              <span className="realTalkText">↓ ok let's be real, you're here for the resumé ↓</span>
            </Link>
          </div>

          <div className="quoteBlock">
            <div className="quoteContent">
              <p className="quoteText">
                "Do not fear to be eccentric in opinion, for every opinion now accepted was once eccentric."
              </p>
            </div>
          </div>
        </div>

        <div className="scrollIndicator">
          <span>↓ explore the gu-niverse ↓</span>
        </div>
      </section>

      {/* Graph Section */}
      <section className="graphSection">
        <div className="wipBadge">
          🚧 WIP: Node graph visualization in progress
          <div className="wipTooltip">
            <div className="tooltipContent">
              Building an encoder that captures how concepts sit in the world: experiential appeal, not just semantics.
              Training a model to predict my affinity for unfamiliar nouns based on how my preferences align with this vector space.
            </div>
          </div>
        </div>
        <BrainGraph externalHoveredGalaxy={selectedGalaxy} />
        <GalaxySelector selectedGalaxy={selectedGalaxy} onGalaxyHover={setSelectedGalaxy} />

      </section>

      {/* Floating Social Links */}
      <div className="floatingActions">
        <a
          href="https://github.com/guha-mahesh"
          target="_blank"
          rel="noopener noreferrer"
          className="floatingButton"
          title="GitHub"
        >
          <FaGithub />
        </a>
        <a
          href="https://linkedin.com/in/guhamahesh"
          target="_blank"
          rel="noopener noreferrer"
          className="floatingButton"
          title="LinkedIn"
        >
          <FaLinkedin />
        </a>
        <a
          href="/GuhaMaheshResumé.pdf"
          onClick={handleResumeDownload}
          className="floatingButton"
          title="Download Resume"
        >
          <FaDownload />
        </a>
      </div>
    </div>
  );
};

export default BrainLanding;
