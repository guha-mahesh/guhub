import { Link } from 'react-router-dom';
import './GalaxyLanding.css';

const CultureLanding = () => {
  return (
    <div className="galaxyLanding">
      <div className="galaxyHeader">
        <Link to="/" className="backButton">
          ← back to home
        </Link>
        <div className="headerContent">
          <span className="headerLabel">[galaxy]</span>
          <h1 className="galaxyTitle">CULTURE</h1>
          <p className="galaxySubtitle">
            examining cultural phenomena and social dynamics
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

export default CultureLanding;
