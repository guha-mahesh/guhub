import { motion } from 'framer-motion';
import './Aquarium.css';

// ──────────────────────────────────────────────────────────────────────
// Steampunk marine creatures animated with framer-motion.
// Bell pulses (jellyfish), mantle jet (squid), staggered nectophore
// throbs (siphonophore), undulating tentacles via path-d interpolation.
// ──────────────────────────────────────────────────────────────────────

// reusable easing
const ease = [0.45, 0, 0.55, 1] as const;

// ── Jellyfish ─────────────────────────────────────────────
function Jellyfish() {
  // Each tentacle has two path keyframes that swap to make a wave.
  const tentaclePairs: [string, string][] = [
    ['M 56 122 Q 50 180 60 230 Q 56 270 62 310',  'M 56 122 Q 62 180 52 230 Q 64 270 54 310'],
    ['M 78 124 Q 74 190 82 240 Q 78 280 84 312',  'M 78 124 Q 82 190 74 240 Q 86 280 76 312'],
    ['M 100 126 Q 100 200 96 260 Q 102 290 98 314','M 100 126 Q 96 200 102 260 Q 98 290 104 314'],
    ['M 122 124 Q 124 190 116 240 Q 122 280 116 312', 'M 122 124 Q 118 190 124 240 Q 116 280 122 312'],
    ['M 144 122 Q 150 180 140 230 Q 146 270 140 310', 'M 144 122 Q 144 180 150 230 Q 140 270 148 310'],
  ];

  return (
    <svg className="jelly" viewBox="0 0 200 320">
      <ellipse cx="100" cy="80" rx="60" ry="44" className="jellyGlow" />

      {/* bell pulses like a swimming jellyfish */}
      <motion.g
        style={{ transformOrigin: '100px 80px', transformBox: 'fill-box' }}
        animate={{ scaleY: [1, 0.92, 1.05, 1], scaleX: [1, 1.05, 0.97, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease, times: [0, 0.4, 0.7, 1] }}
      >
        <path className="ink" d="M 100 18 C 32 26, 24 96, 100 124 C 176 96, 168 26, 100 18 Z" />
        <path className="brass" d="M 36 92 C 70 124, 130 124, 164 92" fill="none" />
        <path className="ink thin" d="M 36 96 Q 50 124 64 110 Q 78 124 92 110 Q 100 124 108 110 Q 122 124 136 110 Q 150 124 164 96" fill="none" />
        <circle cx="100" cy="78" r="14" className="ink thin" fill="none" />
        <line x1="100" y1="78" x2="106" y2="68" className="ink thin" />
        <circle cx="100" cy="78" r="2" className="brassFill" />
        {[60, 80, 100, 120, 140].map(x => (
          <circle key={x} cx={x} cy={104} r="1.6" className="brassFill" />
        ))}
      </motion.g>

      {/* bioluminescent dots inside the bell — pulse with the contraction */}
      <motion.g
        animate={{ opacity: [0.35, 0.85, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, ease }}
      >
        <circle cx="78" cy="68" r="1.6" className="biolume" />
        <circle cx="100" cy="58" r="2"   className="biolume" />
        <circle cx="120" cy="68" r="1.4" className="biolume" />
        <circle cx="92"  cy="88" r="1.5" className="biolume" />
        <circle cx="110" cy="92" r="1.6" className="biolume" />
      </motion.g>

      {/* tentacles undulate via path-d morphing */}
      <g className="jellyTentacles">
        {tentaclePairs.map(([a, b], i) => (
          <motion.path
            key={i}
            initial={{ d: a }}
            animate={{ d: [a, b, a] }}
            transition={{
              duration: 4.2 + i * 0.6,
              repeat: Infinity,
              ease,
              delay: i * 0.3,
            }}
          />
        ))}
      </g>
    </svg>
  );
}

// ── Squid ─────────────────────────────────────────────────
function Squid() {
  const armPairs: [string, string][] = [
    ['M 86 162 Q 70 220 56 296 Q 60 330 50 360',  'M 86 162 Q 78 220 64 296 Q 56 330 58 360'],
    ['M 96 164 Q 86 230 74 304 Q 78 340 68 360',  'M 96 164 Q 92 230 80 304 Q 74 340 74 360'],
    ['M 104 164 Q 100 240 92 318 Q 96 348 90 360','M 104 164 Q 104 240 96 318 Q 92 348 96 360'],
    ['M 116 164 Q 120 240 128 318 Q 124 348 130 360', 'M 116 164 Q 116 240 124 318 Q 128 348 124 360'],
    ['M 124 164 Q 134 230 146 304 Q 142 340 152 360', 'M 124 164 Q 128 230 140 304 Q 146 340 144 360'],
    ['M 134 162 Q 150 220 164 296 Q 160 330 170 360', 'M 134 162 Q 142 220 158 296 Q 162 330 162 360'],
    // long tentacles
    ['M 104 158 Q 90 260 78 340 Q 84 380 60 410',  'M 104 158 Q 98 260 86 340 Q 76 380 70 410'],
    ['M 116 158 Q 130 260 142 340 Q 136 380 160 410', 'M 116 158 Q 122 260 134 340 Q 144 380 150 410'],
  ];

  return (
    <svg className="squid" viewBox="0 0 220 360">
      {/* mantle pulses (jet propulsion feel) */}
      <motion.g
        style={{ transformOrigin: '110px 100px', transformBox: 'fill-box' }}
        animate={{ scaleY: [1, 0.96, 1.03, 1], scaleX: [1, 1.04, 0.98, 1] }}
        transition={{ duration: 1.9, repeat: Infinity, ease, times: [0, 0.45, 0.75, 1] }}
      >
        <path className="ink" d="M 110 6 C 78 10, 66 70, 76 140 C 86 168, 134 168, 144 140 C 154 70, 142 10, 110 6 Z" />
        <path className="ink thin" d="M 70 36 Q 36 56 78 70" fill="none" />
        <path className="ink thin" d="M 150 36 Q 184 56 142 70" fill="none" />
        <path className="ink thin" d="M 78 50 Q 110 56 142 50" fill="none" />
        <path className="ink thin" d="M 76 80 Q 110 86 144 80" fill="none" />
        <path className="ink thin" d="M 76 110 Q 110 116 144 110" fill="none" />
        {[40, 70, 100, 130].map(y => (
          <circle key={y} cx={110} cy={y} r="1.4" className="brassFill" />
        ))}
        <circle cx="86" cy="100" r="9" className="eyeWhite" />
        <circle cx="86" cy="100" r="3.6" className="ink" />
        <circle cx="134" cy="100" r="9" className="eyeWhite" />
        <circle cx="134" cy="100" r="3.6" className="ink" />
        <line x1="110" y1="6" x2="110" y2="-12" className="brass" strokeWidth="2" />
        <ellipse cx="110" cy="-16" rx="22" ry="3" className="ink" />
        <circle cx="110" cy="-16" r="2" className="brassFill" />
      </motion.g>

      {/* arms wave — same easing as mantle, slightly offset for trailing feel */}
      <g className="squidArms">
        {armPairs.map(([a, b], i) => (
          <motion.path
            key={i}
            initial={{ d: a }}
            animate={{ d: [a, b, a] }}
            transition={{
              duration: 3.6 + (i % 3) * 0.5,
              repeat: Infinity,
              ease,
              delay: 0.2 + i * 0.15,
            }}
          />
        ))}
      </g>
    </svg>
  );
}

// ── Siphonophore ──────────────────────────────────────────
function Siphonophore() {
  const nectophores = [
    { y: 70,  r: 16, h: 11 },
    { y: 110, r: 15, h: 10 },
    { y: 145, r: 14, h: 9 },
    { y: 178, r: 13, h: 9 },
    { y: 208, r: 12, h: 8 },
    { y: 236, r: 11, h: 8 },
    { y: 262, r: 10, h: 7 },
    { y: 286, r: 9,  h: 7 },
  ];

  const tentaclePairs: [string, string][] = [
    ['M 50 300 Q 38 350 52 400 Q 42 460 50 510',  'M 50 300 Q 58 350 44 400 Q 60 460 46 510'],
    ['M 50 304 Q 62 360 46 420 Q 58 470 48 520',  'M 50 304 Q 42 360 56 420 Q 44 470 56 520'],
    ['M 48 308 Q 36 380 56 440 Q 40 490 50 530',  'M 48 308 Q 56 380 42 440 Q 58 490 44 530'],
  ];

  return (
    <svg className="sipho" viewBox="0 0 100 540">
      {/* pneumatophore breathes */}
      <motion.g
        style={{ transformOrigin: '50px 22px', transformBox: 'fill-box' }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease }}
      >
        <ellipse cx="50" cy="22" rx="22" ry="16" className="ink" />
        <ellipse cx="50" cy="22" rx="22" ry="16" className="brassGhost" />
        <line x1="50" y1="6" x2="50" y2="-2" className="ink thin" />
        <circle cx="50" cy="-4" r="1.6" className="brassFill" />
      </motion.g>

      {/* central stem */}
      <line x1="50" y1="38" x2="50" y2="500" className="ink thin" />

      {/* nectophore zooids — each pulses in a wave down the chain */}
      {nectophores.map((b, i) => (
        <motion.g
          key={i}
          style={{ transformOrigin: `50px ${b.y}px`, transformBox: 'fill-box' }}
          animate={{ scaleY: [1, 0.85, 1.06, 1], scaleX: [1, 1.08, 0.96, 1] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease,
            delay: i * 0.22,
            times: [0, 0.4, 0.7, 1],
          }}
        >
          <ellipse cx="50" cy={b.y} rx={b.r} ry={b.h} className="ink thin" fill="none" />
          <circle cx="50" cy={b.y} r="1.4" className="brassFill" />
        </motion.g>
      ))}

      {/* trailing stinging tentacles undulate */}
      <g className="siphoTentacles">
        {tentaclePairs.map(([a, b], i) => (
          <motion.path
            key={i}
            initial={{ d: a }}
            animate={{ d: [a, b, a] }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              ease,
              delay: i * 0.4,
            }}
          />
        ))}
      </g>
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// Aquarium — composes the drifting set with motion-driven drift + bob
// ──────────────────────────────────────────────────────────
type Drifter = {
  Cmp: React.FC;
  top: string;
  scale: number;
  opacity: number;
  duration: number;
  delay: number;
  direction: 'ltr' | 'rtl';
  bobAmp: number;
  bobDur: number;
};

const DRIFTERS: Drifter[] = [
  { Cmp: Jellyfish,    top: '6%',  scale: 0.75, opacity: 0.45, duration: 95,  delay: -28,  direction: 'ltr', bobAmp: 14, bobDur: 9  },
  { Cmp: Siphonophore, top: '2%',  scale: 0.55, opacity: 0.40, duration: 130, delay: -70,  direction: 'rtl', bobAmp: 8,  bobDur: 7  },
  { Cmp: Squid,        top: '34%', scale: 0.65, opacity: 0.38, duration: 110, delay: -55,  direction: 'ltr', bobAmp: 18, bobDur: 11 },
  { Cmp: Jellyfish,    top: '52%', scale: 0.5,  opacity: 0.32, duration: 140, delay: -100, direction: 'rtl', bobAmp: 10, bobDur: 8  },
  { Cmp: Siphonophore, top: '14%', scale: 0.42, opacity: 0.30, duration: 165, delay: -40,  direction: 'ltr', bobAmp: 5,  bobDur: 6  },
  { Cmp: Squid,        top: '66%', scale: 0.45, opacity: 0.28, duration: 150, delay: -90,  direction: 'rtl', bobAmp: 12, bobDur: 10 },
  { Cmp: Jellyfish,    top: '76%', scale: 0.6,  opacity: 0.42, duration: 100, delay: -15,  direction: 'ltr', bobAmp: 16, bobDur: 9  },
];

export default function Aquarium() {
  return (
    <div className="aquarium" aria-hidden="true">
      {DRIFTERS.map((d, i) => {
        const fromX = d.direction === 'ltr' ? '-30vw' : '130vw';
        const toX   = d.direction === 'ltr' ? '130vw' : '-30vw';
        return (
          <motion.div
            key={i}
            className="drifter"
            style={{ top: d.top, opacity: d.opacity, position: 'absolute' }}
            initial={{ x: fromX }}
            animate={{ x: toX }}
            transition={{
              duration: d.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: d.delay,
            }}
          >
            <motion.div
              animate={{ y: [-d.bobAmp / 2, d.bobAmp / 2, -d.bobAmp / 2] }}
              transition={{ duration: d.bobDur, repeat: Infinity, ease }}
              style={{ display: 'inline-block' }}
            >
              <div style={{ transform: `scale(${d.scale})`, transformOrigin: 'top left' }}>
                <d.Cmp />
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
