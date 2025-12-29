import { galaxies, type GalaxyType } from '../data/galaxyData';
import './GalaxyBadge.css';

interface GalaxyBadgeProps {
  galaxyId: GalaxyType;
  onClick?: () => void;
  active?: boolean;
}

const GalaxyBadge = ({ galaxyId, onClick, active = false }: GalaxyBadgeProps) => {
  const galaxy = galaxies[galaxyId];

  return (
    <span
      className={`galaxyBadge ${active ? 'active' : ''}`}
      style={{
        backgroundColor: active ? galaxy.color : 'transparent',
        borderColor: galaxy.color,
        color: active ? '#2f0a0a' : galaxy.color,
      }}
      onClick={onClick}
    >
      {galaxy.name}
    </span>
  );
};

export default GalaxyBadge;
