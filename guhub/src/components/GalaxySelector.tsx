import { galaxyArray, type GalaxyType } from '../data/galaxyData';
import './GalaxySelector.css';

interface GalaxySelectorProps {
  selectedGalaxy: GalaxyType | null;
  onGalaxyHover: (galaxy: GalaxyType | null) => void;
}

const GalaxySelector = ({ selectedGalaxy, onGalaxyHover }: GalaxySelectorProps) => {
  return (
    <div className="galaxySelector">
      <p className="galaxySelectorLabel">Explore Gu-Laxies</p>
      <div className="galaxyButtons">
        {galaxyArray.map((galaxy) => (
          <button
            key={galaxy.id}
            className={`galaxyButton ${selectedGalaxy === galaxy.id ? 'active' : ''}`}
            style={{
              borderColor: galaxy.color,
              color: selectedGalaxy === galaxy.id ? '#2f0a0a' : galaxy.color,
              backgroundColor: selectedGalaxy === galaxy.id ? galaxy.color : 'transparent',
            }}
            onMouseEnter={() => onGalaxyHover(galaxy.id)}
            onMouseLeave={() => onGalaxyHover(null)}
            onClick={() => onGalaxyHover(selectedGalaxy === galaxy.id ? null : galaxy.id)}
          >
            {galaxy.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GalaxySelector;
