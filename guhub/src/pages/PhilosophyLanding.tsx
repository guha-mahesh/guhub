import { Link } from 'react-router-dom';
import './GalaxyLanding.css';

const PhilosophyLanding = () => {
  return (
    <div className="galaxyLanding">
      <div className="galaxyHeader">
        <Link to="/" className="backButton">
          ← back to home
        </Link>
        <div className="headerContent">
          <span className="headerLabel">[galaxy]</span>
          <h1 className="galaxyTitle">ETHICS</h1>
          <p className="galaxySubtitle">
            exploring moral philosophy and ethical frameworks
          </p>
        </div>
      </div>

      <div className="galaxyGrid">
        <div className="galaxyCard comingSoon">
          <div className="cardHeader">
            <h2 className="cardTitle">Content In Progress</h2>
            <span className="wipLabel">WIP</span>
          </div>
          <p className="cardDescription">
            This section is currently being developed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhilosophyLanding;
