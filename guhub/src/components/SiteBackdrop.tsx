import Aquarium from './Aquarium';
import './SiteBackdrop.css';

// ──────────────────────────────────────────────────────────────────────
// SiteBackdrop — global warm-soot gradient + drifting steampunk creatures
// + vignette + paper grain. Rendered once at app level so every route
// shares the same atmosphere.
// ──────────────────────────────────────────────────────────────────────
export default function SiteBackdrop() {
  return (
    <>
      <div className="siteBgGradient" />
      <Aquarium />
      <div className="siteBgVignette" />
      <div className="siteBgGrain" />
    </>
  );
}
