import { useState, useEffect } from 'react';
import GlobeSection from '../components/GlobeSection';
import { FaGithub, FaLinkedin, FaLaptop } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './BrainLanding.css';

const BrainLanding = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [globePanelOpen, setGlobePanelOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return (
      <div className="mobileFallback">
        <div className="mobileContent">
          <div className="mobileNameBlock">
            <span className="mobileNameFirst">guha of-sorts</span>
          </div>
          <div className="mobileRoleStack">
            <div className="mobileRoleItem">
              <span className="mobileRoleLabel">[current]</span>
              <span className="mobileRoleText">Human Memory AI Systems</span>
              <span className="mobileRoleCompany">@ Engramme</span>
            </div>
            <div className="mobileRoleItem">
              <span className="mobileRoleLabel">[studying]</span>
              <span className="mobileRoleText">Data Science + FinTech</span>
              <span className="mobileRoleCompany">@ Northeastern</span>
            </div>
          </div>
          <div className="mobileLaptopIcon"><FaLaptop /></div>
          <p className="mobileMessage">For the full interactive experience, please open this on a laptop or desktop.</p>
          <div className="mobileLinks">
            <Link to="/about" className="mobileNavButton">View Resume & Info</Link>
            <Link to="/projects" className="mobileNavButton">View Projects</Link>
          </div>
          <div className="mobileSocial">
            <a href="https://github.com/guha-mahesh" target="_blank" rel="noopener noreferrer" className="mobileSocialButton"><FaGithub /></a>
            <a href="https://linkedin.com/in/guhamahesh" target="_blank" rel="noopener noreferrer" className="mobileSocialButton"><FaLinkedin /></a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="brainLanding">
      {/* Hero */}
      <section className="heroSection">
        <div className="heroGrid">
          <div className="heroMain">
            <div className="nameBlock">
              <span className="nameFirst">guha of-sorts</span>
            </div>
            <div className="roleStack">
              <div className="roleItem">
                <span className="roleLabel">[current]</span>
                <span className="roleText">Human Memory AI Systems</span>
                <span className="roleCompany">@ Engramme</span>
                <span className="roleNote">(Harvard AI spinout · backed by Mayfield Fund · SF)</span>
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
          <span>↓ explore of-sorts ↓</span>
        </div>
      </section>

      {/* Globe */}
      <GlobeSection onPanelChange={setGlobePanelOpen} />

      {/* Floating Social */}
      <div className={`floatingActions ${globePanelOpen ? 'hidden' : ''}`}>
        <a href="https://github.com/guha-mahesh" target="_blank" rel="noopener noreferrer" className="floatingButton" title="GitHub"><FaGithub /></a>
        <a href="https://linkedin.com/in/guhamahesh" target="_blank" rel="noopener noreferrer" className="floatingButton" title="LinkedIn"><FaLinkedin /></a>
      </div>

    </div>
  );
};

export default BrainLanding;
