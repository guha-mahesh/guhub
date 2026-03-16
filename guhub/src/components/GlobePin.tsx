import { useNavigate } from 'react-router-dom';
import './GlobePin.css';

interface Props {
  pinId: string;
  label?: string;
}

export default function GlobePin({ pinId, label }: Props) {
  const navigate = useNavigate();
  return (
    <button
      className="globePin"
      onClick={() => navigate(`/?pin=${pinId}`)}
      title="view on globe"
    >
      ○ {label ?? 'globe'}
    </button>
  );
}
