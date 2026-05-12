import Aquarium from './Aquarium';
import GiantEye from './GiantEye';
import './SiteBackdrop.css';

// ──────────────────────────────────────────────────────────────────────
// SiteBackdrop — global warm-soot gradient + drifting steampunk creatures
// + occasional massive lurking eye + vignette + paper grain. Rendered
// once at app level so every route shares the same atmosphere.
// ──────────────────────────────────────────────────────────────────────
export default function SiteBackdrop() {
  return (
    <>
      <div className="siteBgGradient" />
      <GiantEye />
      <Aquarium />
      <div className="siteBgVignette" />
      <div className="siteBgGrain" />
    </>
  );
}
