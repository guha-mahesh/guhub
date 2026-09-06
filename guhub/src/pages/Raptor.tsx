/**
 * The bird, close up. Placeholder until the drawing lands.
 * Shared space: viewBox "-520 -340 1040 700", origin at the bird's chest.
 */
export default function Raptor() {
  return (
    <svg className="artRaptor" viewBox="-520 -340 1040 700" aria-hidden>
      <g className="raptorPlaceholder">
        <ellipse cx="0" cy="-20" rx="90" ry="120" fill="#050405" />
        <circle cx="0" cy="-215" r="46" fill="#050405" />
      </g>
    </svg>
  );
}
