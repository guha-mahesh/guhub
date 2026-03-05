// Custom SVG icons — no emoji allowed in this codebase
// Each SVG is designed to match the gu-niverse aesthetic: lo-fi, shoegaze-adjacent, technical

export const WipIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline', verticalAlign: 'middle' }}
  >
    {/* Glitchy diamond construction marker */}
    <polygon
      points="12,2 22,12 12,22 2,12"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      opacity="0.9"
    />
    <polygon
      points="12,5 19,12 12,19 5,12"
      stroke="currentColor"
      strokeWidth="0.75"
      fill="currentColor"
      fillOpacity="0.1"
      opacity="0.7"
    />
    {/* Offset glitch stripe */}
    <line x1="7" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.5" />
    <line x1="13" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" />
    <line x1="7" y1="15" x2="11" y2="15" stroke="currentColor" strokeWidth="1.5" />
    {/* Center dot */}
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const TearIcon = ({ size = 22, className = '' }: { size?: number; className?: string }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline', verticalAlign: 'middle' }}
  >
    {/* Minimal face outline */}
    <circle cx="12" cy="11" r="7" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.85" />
    {/* Eyes — simple dots */}
    <circle cx="9.5" cy="10" r="0.9" fill="currentColor" />
    <circle cx="14.5" cy="10" r="0.9" fill="currentColor" />
    {/* Subtle upward curve — "trying not to cry" */}
    <path d="M9.5 13.5 Q12 15.5 14.5 13.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    {/* Tear drop */}
    <path
      d="M15.2 9.5 Q15.8 11 15 12 Q14.2 12.8 15.2 12.8 Q16.2 12.8 15.4 12 Q14.8 11 15.2 9.5 Z"
      fill="currentColor"
      opacity="0.7"
    />
  </svg>
);

export const NodeIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline', verticalAlign: 'middle' }}
  >
    <circle cx="8" cy="8" r="2.5" fill="currentColor" opacity="0.8" />
    <circle cx="2" cy="4" r="1.2" fill="currentColor" opacity="0.5" />
    <circle cx="14" cy="4" r="1.2" fill="currentColor" opacity="0.5" />
    <circle cx="2" cy="12" r="1.2" fill="currentColor" opacity="0.5" />
    <circle cx="14" cy="12" r="1.2" fill="currentColor" opacity="0.5" />
    <line x1="8" y1="8" x2="2" y2="4" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
    <line x1="8" y1="8" x2="14" y2="4" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
    <line x1="8" y1="8" x2="2" y2="12" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
    <line x1="8" y1="8" x2="14" y2="12" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
  </svg>
);

export const PulseIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline', verticalAlign: 'middle' }}
  >
    {/* EKG-style pulse */}
    <polyline
      points="2,12 5,12 7,6 9,18 11,10 13,14 15,12 22,12"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
