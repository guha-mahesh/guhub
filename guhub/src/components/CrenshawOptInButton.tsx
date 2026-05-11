import { useMeta } from '../contexts/MetaContext';
import { useIsMobile } from '../hooks/useIsMobile';
import './CrenshawExplainer.css';

// Tiny "?" button that appears at the bottom-right after the user has
// opted out of the Crenshaw mini-game. Clicking it reopens the explainer
// where they can opt back in (or learn what they're missing).

export default function CrenshawOptInButton() {
  const { optedOut, openExplainer } = useMeta();
  const isMobile = useIsMobile();
  if (!optedOut || isMobile) return null;
  return (
    <button
      type="button"
      className="crenshawOptIn"
      title="about Casper & Crenshaw"
      onClick={openExplainer}
      aria-label="about the casper and crenshaw mini-game"
    >
      ?
    </button>
  );
}
