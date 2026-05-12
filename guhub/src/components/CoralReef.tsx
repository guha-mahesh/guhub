import { motion } from 'framer-motion';
import './CoralReef.css';

// ──────────────────────────────────────────────────────────────────────
// Steampunk coral reef. Stylized brass/ink line drawings at the bottom
// of a page, ambient sway on the fans and anemone tentacles. Designed
// to tile / fill the bottom of the viewport — pointer-events off so it
// stays purely decorative.
// ──────────────────────────────────────────────────────────────────────

const ease = [0.45, 0, 0.55, 1] as const;

// A waving sea-fan, branching from a base point.
function SeaFan({ x, scale = 1 }: { x: number; scale?: number }) {
  return (
    <motion.g
      transform={`translate(${x}, 230) scale(${scale})`}
      style={{ transformOrigin: `${x}px 230px`, transformBox: 'fill-box' }}
      animate={{ rotate: [-1.5, 1.5, -1.5] }}
      transition={{ duration: 6 + Math.random() * 3, repeat: Infinity, ease }}
    >
      <path
        className="reefBrass"
        fill="none"
        d="M 0 0 Q -10 -30 -20 -60
           M 0 0 Q -4 -40 -8 -85
           M 0 0 Q 0 -50 -2 -100
           M 0 0 Q 4 -40 8 -85
           M 0 0 Q 10 -30 20 -60
           M 0 0 Q -6 -20 -16 -42
           M 0 0 Q 6 -20 16 -42"
      />
      <circle cx="-20" cy="-60" r="1.8" className="reefBrassFill" />
      <circle cx="-8" cy="-85" r="1.8" className="reefBrassFill" />
      <circle cx="-2" cy="-100" r="1.8" className="reefBrassFill" />
      <circle cx="8" cy="-85" r="1.8" className="reefBrassFill" />
      <circle cx="20" cy="-60" r="1.8" className="reefBrassFill" />
    </motion.g>
  );
}

// A dome of brain-coral, stippled with rivet dots.
function CoralDome({ x }: { x: number }) {
  return (
    <g transform={`translate(${x}, 230)`}>
      <path
        className="reefInk"
        fill="var(--reefBrassColor)"
        fillOpacity="0.18"
        d="M -30 0 Q -28 -32, 0 -38 Q 28 -32, 30 0 Z"
      />
      <circle cx="-18" cy="-18" r="1.6" className="reefBrassFill" />
      <circle cx="-6" cy="-26" r="1.6" className="reefBrassFill" />
      <circle cx="6" cy="-22" r="1.6" className="reefBrassFill" />
      <circle cx="18" cy="-14" r="1.6" className="reefBrassFill" />
      <circle cx="0" cy="-10" r="1.4" className="reefBrassFill" />
    </g>
  );
}

// A vertical sponge column with a brass-rimmed opening at the top.
function SpongeTower({ x, height = 60 }: { x: number; height?: number }) {
  return (
    <g transform={`translate(${x}, 230)`}>
      <rect
        x="-14" y={-height} width="28" height={height}
        className="reefInk" fill="var(--reefBrassColor)" fillOpacity="0.13"
      />
      <ellipse cx="0" cy={-height} rx="14" ry="4.5" className="reefInk" />
      <ellipse cx="0" cy={-height} rx="8" ry="2.5" className="reefInk" fill="var(--reefInkColor)" fillOpacity="0.45" />
      <line x1="-14" y1={-height/2} x2="14" y2={-height/2} className="reefBrass" strokeWidth="1" />
      <circle cx="-14" cy={-height/2} r="1.4" className="reefBrassFill" />
      <circle cx="14"  cy={-height/2} r="1.4" className="reefBrassFill" />
    </g>
  );
}

// Brass-pipe corals — angular branching tubes.
function PipeCoral({ x }: { x: number }) {
  return (
    <g transform={`translate(${x}, 230)`}>
      <path
        className="reefInk"
        fill="var(--reefBrassColor)" fillOpacity="0.16"
        d="M -22 0 L -16 -28 L -6 -28 L -2 0 Z"
      />
      <path
        className="reefInk"
        fill="var(--reefBrassColor)" fillOpacity="0.16"
        d="M 0 0 L 4 -38 L 18 -34 L 22 0 Z"
      />
      <path
        className="reefInk"
        fill="var(--reefBrassColor)" fillOpacity="0.16"
        d="M 24 0 L 30 -22 L 42 -18 L 44 0 Z"
      />
      <circle cx="-11" cy="-28" r="1.4" className="reefBrassFill" />
      <circle cx="11" cy="-36" r="1.4" className="reefBrassFill" />
      <circle cx="36" cy="-20" r="1.4" className="reefBrassFill" />
    </g>
  );
}

// Sea anemone with waving brass tentacles tipped in ember biolume.
function Anemone({ x }: { x: number }) {
  const tentacles = [-16, -8, 0, 8, 16];
  return (
    <g transform={`translate(${x}, 230)`}>
      <ellipse
        cx="0" cy="-5" rx="22" ry="6"
        className="reefInk" fill="var(--reefInkColor)" fillOpacity="0.4"
      />
      {tentacles.map((tx, i) => (
        <motion.g
          key={tx}
          animate={{ rotate: [-3, 3, -3] }}
          transition={{
            duration: 3.5 + i * 0.4,
            repeat: Infinity,
            ease,
            delay: i * 0.2,
          }}
          style={{ transformOrigin: `${tx}px -8px` }}
        >
          <path
            className="reefBrass"
            fill="none" strokeWidth="1.4"
            d={`M ${tx} -8 Q ${tx + 2} -28 ${tx - 1} -46`}
          />
          <circle cx={tx - 1} cy="-46" r="1.6" className="reefBiolume" />
        </motion.g>
      ))}
    </g>
  );
}

// A small steampunk crab sitting on the reef floor. Big claws + a
// riveted shell. Gentle bob so it reads as alive.
function Crab({ x }: { x: number }) {
  return (
    <motion.g
      transform={`translate(${x}, 230)`}
      animate={{ y: [0, -1.4, 0] }}
      transition={{ duration: 3.6 + Math.random() * 1.5, repeat: Infinity, ease }}
    >
      {/* shell dome */}
      <path
        className="reefInk"
        fill="var(--reefBrassColor)" fillOpacity="0.28"
        d="M -16 -2 Q -16 -16, 0 -18 Q 16 -16, 16 -2 Z"
      />
      {/* shell texture seams */}
      <path className="reefInk thin" fill="none" d="M -10 -12 L -8 -4 M 0 -14 L 0 -4 M 10 -12 L 8 -4" />
      {/* rivets */}
      <circle cx="-8" cy="-12" r="0.9" className="reefBrassFill" />
      <circle cx="8" cy="-12" r="0.9" className="reefBrassFill" />
      <circle cx="0" cy="-15" r="0.9" className="reefBrassFill" />
      {/* eyes on stalks */}
      <line className="reefBrass" x1="-5" y1="-18" x2="-5" y2="-23" strokeWidth="0.9" />
      <line className="reefBrass" x1="5" y1="-18" x2="5" y2="-23" strokeWidth="0.9" />
      <circle cx="-5" cy="-23.5" r="1.3" className="reefBrassFill" />
      <circle cx="5" cy="-23.5" r="1.3" className="reefBrassFill" />
      {/* left claw */}
      <path
        className="reefInk"
        fill="var(--reefBrassColor)" fillOpacity="0.32"
        d="M -16 -8 L -26 -12 L -30 -8 L -28 -3 L -22 -4 Z"
      />
      {/* right claw */}
      <path
        className="reefInk"
        fill="var(--reefBrassColor)" fillOpacity="0.32"
        d="M 16 -8 L 26 -12 L 30 -8 L 28 -3 L 22 -4 Z"
      />
      {/* legs (3 per side) */}
      <path className="reefInk thin" fill="none" d="M -14 -2 L -22 4 M -14 0 L -22 7 M -12 2 L -20 9" />
      <path className="reefInk thin" fill="none" d="M 14 -2 L 22 4 M 14 0 L 22 7 M 12 2 L 20 9" />
    </motion.g>
  );
}

// Reef octopus, head peeking out, tentacles trailing and waving.
function Octopus({ x }: { x: number }) {
  const tentacles: Array<[number, number, number, number]> = [
    // [startX, startY, controlOffset, endX, endY]  (using Q curve)
    [-11, -32, -18, 0],
    [-7,  -36, -10, 4],
    [-2,  -38, -4,  6],
    [3,   -38,  4,  6],
    [8,   -36, 10,  4],
    [12,  -32, 18,  0],
    [-9,  -28, -22, -6],
    [10,  -28,  22, -6],
  ];
  return (
    <g transform={`translate(${x}, 230)`}>
      {/* head bulb */}
      <ellipse
        cx="0" cy="-46" rx="14" ry="17"
        className="reefInk"
        fill="var(--reefBrassColor)" fillOpacity="0.28"
      />
      {/* brass crown (steampunk hat band) */}
      <path className="reefBrass" fill="none" strokeWidth="1.2" d="M -12 -57 Q 0 -62, 12 -57" />
      <circle cx="-12" cy="-57" r="1.2" className="reefBrassFill" />
      <circle cx="0" cy="-61" r="1.4" className="reefBrassFill" />
      <circle cx="12" cy="-57" r="1.2" className="reefBrassFill" />
      {/* eyes */}
      <circle cx="-5" cy="-48" r="2.6" className="reefBrass" fill="none" />
      <circle cx="-5" cy="-48" r="1.2" className="reefBrassFill" />
      <circle cx="5" cy="-48" r="2.6" className="reefBrass" fill="none" />
      <circle cx="5" cy="-48" r="1.2" className="reefBrassFill" />
      {/* tentacles — wave subtly via group rotation */}
      {tentacles.map(([sx, sy, ex, ey], i) => {
        const cpx = (sx + ex) / 2 + (i % 2 === 0 ? -3 : 3);
        const cpy = (sy + ey) / 2 + 6;
        return (
          <motion.path
            key={i}
            className="reefBrass"
            fill="none"
            strokeWidth="1.2"
            d={`M ${sx} ${sy} Q ${cpx} ${cpy}, ${ex} ${ey}`}
            animate={{ rotate: [-2.5, 2.5, -2.5] }}
            transition={{
              duration: 4 + i * 0.25,
              repeat: Infinity,
              ease,
              delay: i * 0.18,
            }}
            style={{ transformOrigin: `${sx}px ${sy}px` }}
          />
        );
      })}
    </g>
  );
}

// A small brass-cased clam (closed shell) sitting on the floor.
function Clam({ x }: { x: number }) {
  return (
    <g transform={`translate(${x}, 230)`}>
      <path
        className="reefInk"
        fill="var(--reefBrassColor)" fillOpacity="0.2"
        d="M -16 0 Q -16 -14, 0 -16 Q 16 -14, 16 0 Z"
      />
      <path
        className="reefInk thin"
        fill="none"
        d="M -14 -6 Q 0 -10, 14 -6"
      />
      <circle cx="-16" cy="0" r="1.4" className="reefBrassFill" />
      <circle cx="16" cy="0" r="1.4" className="reefBrassFill" />
      <circle cx="0" cy="-16" r="1.4" className="reefBrassFill" />
    </g>
  );
}

// Tall ribbon of brass kelp swaying.
function Kelp({ x, height = 200 }: { x: number; height?: number }) {
  const segments = Array.from({ length: Math.floor(height / 24) }, (_, i) => i);
  return (
    <motion.g
      transform={`translate(${x}, 230)`}
      animate={{ rotate: [-2.5, 2.5, -2.5] }}
      transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, ease }}
      style={{ transformOrigin: `${x}px 230px` }}
    >
      <path
        className="reefInk thin"
        fill="none"
        d={`M 0 0 Q -3 -${height / 2}, 0 -${height}`}
      />
      {segments.map(i => (
        <ellipse
          key={i}
          cx={i % 2 === 0 ? -5 : 5}
          cy={-(i * 24 + 14)}
          rx="6" ry="3"
          className="reefBrass"
          fill="var(--reefBrassColor)" fillOpacity="0.2"
          strokeWidth="0.8"
        />
      ))}
    </motion.g>
  );
}

export default function CoralReef() {
  return (
    <div className="coralReef" aria-hidden="true">
      <svg
        className="coralReefSvg"
        viewBox="0 0 1200 240"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* sea floor */}
        <path
          className="reefFloor"
          d="M 0 232
             Q 100 224 200 230
             Q 320 234 440 226
             Q 560 230 680 224
             Q 800 228 920 222
             Q 1040 226 1200 230
             L 1200 240
             L 0 240 Z"
        />

        {/* sparse base sediment rocks */}
        {[80, 260, 420, 600, 760, 940, 1100].map(x => (
          <ellipse key={x} cx={x} cy="232" rx="14" ry="3" className="reefInk thin" />
        ))}

        {/* the cast */}
        <Kelp x={60}  height={220} />
        <SeaFan x={120} scale={1} />
        <CoralDome x={210} />
        <Crab x={250} />
        <SpongeTower x={285} height={70} />
        <Clam x={345} />
        <PipeCoral x={400} />
        <Octopus x={460} />
        <SeaFan x={490} scale={1.3} />
        <Anemone x={580} />
        <Crab x={620} />
        <CoralDome x={660} />
        <SpongeTower x={720} height={50} />
        <Kelp x={780} height={170} />
        <PipeCoral x={840} />
        <SeaFan x={930} scale={0.85} />
        <Octopus x={970} />
        <Clam x={1005} />
        <Anemone x={1040} />
        <Crab x={1080} />
        <CoralDome x={1110} />
        <SpongeTower x={1170} height={60} />
      </svg>
    </div>
  );
}
