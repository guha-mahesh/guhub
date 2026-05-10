import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useCrenshaw, type Corner } from '../contexts/CrenshawContext';
import './Anteater.css';

// ──────────────────────────────────────────────────────────────────────
// Crenshaw — small steampunk anteater. Pokes out of one of four corners,
// oriented differently each time. As the cursor closes in he scurries
// off-screen and relocates to a different tab + corner.
// ──────────────────────────────────────────────────────────────────────

const PROXIMITY = 240;
const TUCK_DURATION = 220;

// per-corner positioning: he's tucked near a corner, partially overhanging
// the edge. Offset is gentle so he stays visible — finding him is the game,
// but if he's fully off-screen the game can't start.
const POSITION: Record<Corner, React.CSSProperties> = {
  BL: { bottom: '5vh', left: '-10px' },
  BR: { bottom: '5vh', right: '-10px' },
  TL: { top: '11vh', left: '-10px' },
  TR: { top: '11vh', right: '-10px' },
};

// per-corner inner-flip so the head always points INTO the page
const FLIP: Record<Corner, string> = {
  BL: 'none',
  BR: 'scaleX(-1)',
  TL: 'scaleY(-1)',
  TR: 'scale(-1, -1)',
};

// per-corner direction the wrapper slides during tuck (toward the corner / off-screen)
const TUCK: Record<Corner, { x: number; y: number }> = {
  BL: { x: -180, y: 0 },
  BR: { x:  180, y: 0 },
  TL: { x: -180, y: 0 },
  TR: { x:  180, y: 0 },
};

export default function Anteater() {
  const { currentRoute, currentCorner, relocate } = useCrenshaw();
  const location = useLocation();
  const onPath = location.pathname === currentRoute;

  const [tucked, setTucked] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTucked(false);
  }, [currentRoute, currentCorner, location.pathname]);

  useEffect(() => {
    if (!onPath || tucked) return;
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < PROXIMITY) {
        setTucked(true);
        setTimeout(relocate, TUCK_DURATION);
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [onPath, tucked, relocate]);

  const tuckOffset = TUCK[currentCorner];
  const fromX = tuckOffset.x;
  const fromY = tuckOffset.y;

  // small random rotation tilt, stable per route+corner pair
  const tilt = useMemo(() => {
    const seed = (currentRoute + currentCorner)
      .split('')
      .reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
    return (seed % 13) - 6; // -6 to +6 deg
  }, [currentRoute, currentCorner]);

  if (!onPath) return null;

  return (
    <motion.div
      ref={ref}
      className="anteaterAnchor"
      style={POSITION[currentCorner]}
      initial={{ x: fromX, y: fromY, opacity: 0 }}
      animate={tucked ? { x: fromX, y: fromY, opacity: 0 } : { x: 0, y: 0, opacity: 1 }}
      transition={{
        duration: tucked ? TUCK_DURATION / 1000 : 0.95,
        ease: tucked ? [0.85, 0, 0.95, 0.4] : [0.16, 1, 0.3, 1],
        delay: tucked ? 0 : 0.18,
      }}
      aria-hidden="true"
    >
      {/* inner div applies the orientation flip + tilt so motion can keep
          working in screen-space on the wrapper */}
      <div style={{ transform: `${FLIP[currentCorner]} rotate(${tilt}deg)` }}>
        <motion.div
          className="anteaterBob"
          animate={{ y: [-1.4, 1.4, -1.4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        >
          <svg
            className="anteater"
            viewBox="0 0 280 150"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* tail bushy plume */}
            <path
              className="atrTail"
              d="M 200 80
                 C 220 64, 250 56, 268 72
                 C 280 88, 270 110, 250 110
                 C 232 110, 215 102, 205 96
                 C 200 92, 198 86, 200 80 Z"
            />
            <g className="atrTailFur">
              <line x1="218" y1="74" x2="222" y2="62" />
              <line x1="232" y1="68" x2="236" y2="56" />
              <line x1="248" y1="65" x2="254" y2="54" />
              <line x1="262" y1="68" x2="270" y2="60" />
              <line x1="266" y1="80" x2="276" y2="80" />
              <line x1="262" y1="94" x2="272" y2="100" />
              <line x1="248" y1="105" x2="254" y2="116" />
            </g>

            {/* main silhouette */}
            <path
              className="atrSilhouette"
              d="M 8 78
                 C 26 76, 50 74, 75 74
                 C 82 73, 88 70, 92 64
                 C 100 54, 115 48, 135 50
                 C 158 52, 178 60, 192 70
                 C 200 74, 206 80, 208 88
                 C 208 96, 206 104, 200 110
                 C 190 114, 178 114, 168 113
                 C 154 113, 142 112, 130 113
                 C 130 124, 130 132, 130 132
                 L 140 132
                 L 140 118
                 C 140 112, 134 108, 124 108
                 C 110 110, 92 112, 80 110
                 C 80 122, 80 132, 80 132
                 L 90 132
                 L 90 118
                 C 88 110, 82 104, 72 98
                 C 64 94, 56 90, 50 87
                 C 36 87, 22 86, 8 84
                 Q 4 81, 8 78 Z"
            />

            <path className="atrEar" d="M 110 56 L 116 47 L 118 58 Z" />

            <circle cx="98" cy="62" r="2.4" className="atrEye" />
            <circle cx="97" cy="61" r="0.7" className="atrEyeGlint" />

            <ellipse cx="13" cy="80" rx="1.6" ry="1.1" className="atrNostril" />

            <path
              className="atrStripeBlack"
              d="M 96 60
                 C 92 78, 95 96, 102 110
                 C 108 122, 116 130, 122 132"
            />
            <path
              className="atrStripeWhite"
              d="M 95 59
                 C 91 77, 94 95, 101 109
                 C 107 121, 115 129, 121 131"
            />

            <g className="atrFur">
              {[
                [125, 55], [145, 56], [165, 62],
                [180, 66], [195, 72],
                [110, 78], [130, 80], [150, 82], [170, 84],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1.1" />
              ))}
            </g>

            <g className="atrClaws">
              <path d="M 80 132 Q 78 138 76 142" />
              <path d="M 85 132 Q 85 139 86 144" />
              <path d="M 90 132 Q 92 138 95 142" />
            </g>
            <g className="atrClaws">
              <path d="M 130 132 Q 128 138 127 142" />
              <path d="M 135 132 Q 135 139 135 144" />
              <path d="M 140 132 Q 142 138 144 142" />
            </g>

            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '152px 76px' }}
            >
              <g transform="translate(152, 76)">
                {Array.from({ length: 8 }).map((_, i) => (
                  <rect
                    key={i}
                    x={-1.4}
                    y={-9}
                    width={2.8}
                    height={3.5}
                    className="atrGearTooth"
                    transform={`rotate(${i * 45})`}
                  />
                ))}
                <circle r="6.5" className="atrGearRim" />
                <circle r="3.5" className="atrGearInner" />
                <circle r="1" className="atrGearBolt" />
              </g>
            </motion.g>
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}
