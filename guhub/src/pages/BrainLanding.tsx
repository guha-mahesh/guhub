import { useState, useEffect } from 'react';
import BrainGraph from '../components/BrainGraph';
import GalaxySelector from '../components/GalaxySelector';
import { FaGithub, FaLinkedin, FaLaptop } from 'react-icons/fa';
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

  if (isMobile) {
    return (
      <div className="mobileFallback">
        <div className="mobileContent">
          <h1 className="mobileTitle">Guha Mahesh</h1>

          <div className="mobileRoleStack">
            <div className="mobileRoleItem">
              <span className="mobileRoleLabel">[current]</span>
              <span className="mobileRoleText">Human Memory AI Systems</span>
              <span className="mobileRoleCompany">@ Memory Machines</span>
            </div>
            <div className="mobileRoleItem">
              <span className="mobileRoleLabel">[studying]</span>
              <span className="mobileRoleText">Data Science + FinTech</span>
              <span className="mobileRoleCompany">@ Northeastern</span>
            </div>
          </div>

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
            {/* <a href="/GuhaMaheshResumé.pdf" onClick={handleResumeDownload} className="mobileSocialButton">
              <FaDownload />
            </a> */}
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
              <Link to="/music" className="interestTag">music</Link>
              <Link to="/philosophy" className="interestTag">ethics</Link>
              <Link to="/culture" className="interestTag">culture</Link>
              <Link to="/geography" className="interestTag">geography</Link>
              <Link to="/animals" className="interestTag">animals</Link>
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
        {/* <a
          href="/GuhaMaheshResumé.pdf"
          onClick={handleResumeDownload}
          className="floatingButton"
          title="Download Resume"
        >
          <FaDownload />
        </a> */}
      </div>
    </div>
  );
};

export default BrainLanding;
