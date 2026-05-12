import { motion } from 'framer-motion';
import { useUserFish } from '../hooks/useUserFish';
import './Aquarium.css';

// ──────────────────────────────────────────────────────────────────────
// Steampunk marine creatures animated with framer-motion.
// Bell pulses (jellyfish), mantle jet (squid), staggered nectophore
// throbs (siphonophore), undulating tentacles via path-d interpolation.
// Plus rare species (shark, whale, mosasaurus) that pass less often.
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

      {/* bioluminescent dots inside the bell, pulse with the contraction */}
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

      {/* arms wave, same easing as mantle, slightly offset for trailing feel */}
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

      {/* nectophore zooids, each pulses in a wave down the chain */}
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

// ── Shark (rare) ──────────────────────────────────────────
// Sleek torpedo body, brass nose plate, dorsal gear, monocle eye.
function Shark() {
  return (
    <svg className="shark" viewBox="0 0 320 140">
      {/* caudal tail fin (heterocercal — top lobe longer) */}
      <path className="ink" d="M 60 70 L 8 22 L 32 70 L 8 118 Z" />

      {/* main body, torpedo shape */}
      <path
        className="ink"
        d="M 310 70
           Q 290 50, 222 50
           Q 150 48, 102 56
           Q 72 62, 60 70
           Q 72 78, 102 86
           Q 150 92, 222 90
           Q 290 90, 310 70 Z"
      />

      {/* dorsal fin */}
      <path className="ink" d="M 168 52 L 184 22 L 206 50 Z" />

      {/* pectoral fin */}
      <path className="ink" d="M 238 88 L 256 116 L 282 92 Z" />

      {/* gill slits */}
      <path className="ink thin" d="M 248 62 L 248 78" fill="none" />
      <path className="ink thin" d="M 256 62 L 256 78" fill="none" />
      <path className="ink thin" d="M 264 62 L 264 78" fill="none" />

      {/* mouth (slight grin) */}
      <path className="ink thin" d="M 268 80 Q 290 86, 306 78" fill="none" />

      {/* eye + brass monocle ring */}
      <circle cx="286" cy="62" r="6" className="brass" fill="none" />
      <circle cx="286" cy="62" r="2.6" className="brassFill" />

      {/* brass dorsal gear bolt */}
      <circle cx="184" cy="34" r="3.5" className="brassFill" />

      {/* brass nose plate (rim around snout tip) */}
      <path className="brass" d="M 304 60 Q 316 70, 304 80" fill="none" strokeWidth="2" />

      {/* rivets along the hull */}
      <circle cx="120" cy="80" r="1.4" className="brassFill" />
      <circle cx="160" cy="82" r="1.4" className="brassFill" />
      <circle cx="200" cy="80" r="1.4" className="brassFill" />
      <circle cx="244" cy="76" r="1.4" className="brassFill" />
    </svg>
  );
}

// ── Whale (rare) ──────────────────────────────────────────
// Massive body, horizontal fluke, blowhole with steam, brass gear & seams.
function Whale() {
  return (
    <svg className="whale" viewBox="0 0 380 200">
      {/* steam plumes rising above blowhole */}
      <ellipse cx="318" cy="30" rx="6" ry="4" className="brassGhost" />
      <ellipse cx="324" cy="14" rx="5" ry="3" className="brassGhost" />
      <ellipse cx="316" cy="-2" rx="4" ry="2.5" className="brassGhost" />

      {/* main body */}
      <path
        className="ink"
        d="M 370 90
           Q 380 80, 370 65
           Q 350 50, 300 50
           Q 220 44, 140 48
           Q 80 54, 50 65
           L 50 110
           Q 80 118, 140 124
           Q 220 128, 300 122
           Q 350 116, 370 100
           Q 380 92, 370 90 Z"
      />

      {/* horizontal tail fluke */}
      <path className="ink" d="M 50 88 L 4 60 L 22 88 L 4 116 L 50 100 Z" />

      {/* pectoral flipper */}
      <path className="ink" d="M 280 115 L 296 142 L 318 120 Z" />

      {/* baleen mouth line */}
      <path className="ink thin" d="M 220 100 Q 290 106, 358 92" fill="none" />

      {/* eye + monocle */}
      <circle cx="338" cy="76" r="6" className="brass" fill="none" />
      <circle cx="338" cy="76" r="2.8" className="brassFill" />

      {/* blowhole */}
      <ellipse cx="320" cy="48" rx="4.5" ry="2" className="brassFill" />

      {/* large brass gear on side */}
      <circle cx="220" cy="80" r="9" className="brass" fill="none" />
      <circle cx="220" cy="80" r="2.4" className="brassFill" />
      {/* gear teeth, simple */}
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <line
          key={deg}
          x1="220"
          y1="71"
          x2="220"
          y2="67"
          className="brass"
          strokeWidth="1.4"
          transform={`rotate(${deg} 220 80)`}
        />
      ))}

      {/* hull seams + rivets */}
      <path className="ink thin" d="M 160 62 L 160 122" fill="none" />
      <path className="ink thin" d="M 270 58 L 270 122" fill="none" />
      <circle cx="160" cy="62" r="1.5" className="brassFill" />
      <circle cx="160" cy="122" r="1.5" className="brassFill" />
      <circle cx="270" cy="58" r="1.5" className="brassFill" />
      <circle cx="270" cy="122" r="1.5" className="brassFill" />
    </svg>
  );
}

// ── Mosasaurus (rare) ─────────────────────────────────────
// Long sinuous prehistoric body, four paddle limbs, armored bands.
function Mosasaurus() {
  return (
    <svg className="mosa" viewBox="0 0 440 160">
      {/* main body — long ribbon */}
      <path
        className="ink"
        d="M 425 75
           Q 410 55, 360 52
           Q 280 48, 200 56
           Q 120 60, 60 72
           Q 30 78, 10 82
           Q 30 92, 60 90
           Q 120 92, 200 92
           Q 280 90, 360 82
           Q 410 78, 425 75 Z"
      />

      {/* tail end fin */}
      <path className="ink" d="M 10 82 L -4 56 L 6 82 L -4 112 Z" />

      {/* front (right) paddle limb */}
      <path className="ink" d="M 285 88 L 305 122 L 325 92 Z" />

      {/* rear (left) paddle limb */}
      <path className="ink" d="M 128 90 L 148 124 L 170 95 Z" />

      {/* small dorsal ridge */}
      <path className="ink" d="M 250 54 L 262 38 L 278 53 Z" />

      {/* eye + monocle */}
      <circle cx="400" cy="66" r="5.5" className="brass" fill="none" />
      <circle cx="400" cy="66" r="2.4" className="brassFill" />

      {/* open jaw with two teeth */}
      <path className="ink" d="M 425 75 Q 418 84, 406 83" fill="none" />
      <path className="ink thin" d="M 412 78 L 412 84" fill="none" />
      <path className="ink thin" d="M 418 76 L 418 83" fill="none" />

      {/* armor plates: three diagonal brass bands across the body */}
      <path
        className="brass"
        d="M 100 66 L 95 90 L 115 90 L 120 66 Z"
        fill="var(--brass)"
        fillOpacity="0.18"
        strokeWidth="1"
      />
      <path
        className="brass"
        d="M 200 62 L 195 92 L 215 92 L 220 62 Z"
        fill="var(--brass)"
        fillOpacity="0.18"
        strokeWidth="1"
      />
      <path
        className="brass"
        d="M 310 58 L 305 86 L 325 86 L 330 58 Z"
        fill="var(--brass)"
        fillOpacity="0.18"
        strokeWidth="1"
      />

      {/* rivets at the plate edges */}
      <circle cx="100" cy="66" r="1.2" className="brassFill" />
      <circle cx="120" cy="66" r="1.2" className="brassFill" />
      <circle cx="200" cy="62" r="1.2" className="brassFill" />
      <circle cx="220" cy="62" r="1.2" className="brassFill" />
      <circle cx="310" cy="58" r="1.2" className="brassFill" />
      <circle cx="330" cy="58" r="1.2" className="brassFill" />
    </svg>
  );
}

// ── Saltwater Crocodile (very rare, MASSIVE) ──────────────
// Long armored body, four stubby legs with toe-claws, osteoderm spikes
// along the spine, brass plate panels riveted to the hull, shoulder gear,
// teeth in a half-open jaw, monocle eye set high on the head.
function Croc() {
  return (
    <svg className="croc" viewBox="0 0 600 180">
      {/* main silhouette */}
      <path
        className="ink"
        d="M 588 96
           Q 568 78, 502 80
           L 480 58
           Q 412 54, 364 62
           Q 280 64, 192 72
           Q 110 82, 12 100
           L 32 110
           Q 110 112, 188 108
           L 198 132
           L 212 152
           L 244 152
           L 234 124
           Q 296 118, 360 118
           L 408 122
           L 418 145
           L 444 152
           L 458 124
           Q 478 118, 498 112
           L 500 116
           Q 568 118, 588 96 Z"
      />

      {/* osteoderm spikes along the back ridge */}
      <path
        className="ink thin"
        fill="none"
        d="M 200 67 L 210 56 L 222 68
           M 240 65 L 250 54 L 262 66
           M 280 64 L 290 53 L 302 65
           M 320 64 L 330 53 L 342 65
           M 360 62 L 370 51 L 382 63
           M 400 62 L 410 51 L 422 63
           M 440 60 L 450 50 L 462 62"
      />

      {/* eye + monocle (on top of head) */}
      <circle cx="488" cy="58" r="6" className="brass" fill="none" />
      <circle cx="488" cy="58" r="2.8" className="brassFill" />
      <circle cx="487" cy="57" r="0.8" className="biolume" />

      {/* nostril at snout tip */}
      <ellipse cx="572" cy="84" rx="2.2" ry="1.1" className="ink" fill="var(--ink)" />

      {/* upper jaw teeth — zigzag */}
      <path
        className="ink thin"
        fill="none"
        d="M 510 88 L 512 95 L 516 88 L 520 95 L 524 88 L 528 95 L 532 88 L 536 95 L 540 88 L 544 95 L 548 88"
      />

      {/* lower jaw teeth — zigzag */}
      <path
        className="ink thin"
        fill="none"
        d="M 510 110 L 512 103 L 516 110 L 520 103 L 524 110 L 528 103 L 532 110 L 536 103 L 540 110 L 544 103 L 548 110"
      />

      {/* mouth seam */}
      <line x1="500" y1="99" x2="588" y2="96" className="ink thin" />

      {/* brass armor plate panels (back side, semi-transparent) */}
      <path
        className="brass"
        d="M 220 78 L 218 100 L 240 100 L 242 76 Z"
        fill="var(--brass)" fillOpacity="0.16" strokeWidth="1"
      />
      <path
        className="brass"
        d="M 280 76 L 278 102 L 300 102 L 302 74 Z"
        fill="var(--brass)" fillOpacity="0.16" strokeWidth="1"
      />
      <path
        className="brass"
        d="M 340 74 L 338 104 L 360 104 L 362 72 Z"
        fill="var(--brass)" fillOpacity="0.16" strokeWidth="1"
      />
      <path
        className="brass"
        d="M 400 72 L 398 106 L 420 106 L 422 70 Z"
        fill="var(--brass)" fillOpacity="0.16" strokeWidth="1"
      />

      {/* shoulder gear */}
      <circle cx="460" cy="84" r="9" className="brass" fill="none" />
      <circle cx="460" cy="84" r="2.6" className="brassFill" />
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <line
          key={deg}
          x1="460" y1="74" x2="460" y2="70"
          className="brass" strokeWidth="1.4"
          transform={`rotate(${deg} 460 84)`}
        />
      ))}

      {/* rivets at plate corners */}
      {[[220,78],[242,78],[280,76],[302,76],[340,74],[362,74],[400,72],[422,72]].map(([x,y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" className="brassFill" />
      ))}

      {/* toe-claws — front foot */}
      <path
        className="ink thin"
        fill="none"
        d="M 422 152 L 419 159 M 432 152 L 432 160 M 442 152 L 444 159"
      />
      {/* toe-claws — back foot */}
      <path
        className="ink thin"
        fill="none"
        d="M 217 152 L 213 159 M 228 152 L 228 160 M 240 152 L 243 159"
      />
    </svg>
  );
}

// ── Anglerfish (deep-sea, common-rare) ────────────────────
// Round body, downturned jagged-tooth mouth, bioluminescent lure on a
// stalk, brass plate seam, monocle eye.
function Anglerfish() {
  return (
    <svg className="angler" viewBox="0 0 220 160">
      {/* heterocercal tail */}
      <path className="ink" d="M 60 90 L 14 50 L 36 90 L 14 130 Z" />

      {/* body */}
      <path
        className="ink"
        d="M 60 90
           Q 54 50, 96 38
           Q 142 28, 170 56
           Q 188 84, 168 112
           Q 148 132, 108 134
           Q 76 130, 60 90 Z"
      />

      {/* lure stalk */}
      <path className="ink thin" fill="none" d="M 120 38 Q 138 18, 146 4" />
      <circle cx="146" cy="4" r="6" className="brass" fill="none" />
      <circle cx="146" cy="4" r="3" className="biolume" />

      {/* zigzag mouth (upper + lower teeth) */}
      <path
        className="ink thin"
        fill="none"
        d="M 100 110 L 104 118 L 110 110 L 116 118 L 122 110 L 128 118 L 134 110 L 140 118 L 146 110"
      />
      <path
        className="ink thin"
        fill="none"
        d="M 100 130 L 104 122 L 110 130 L 116 122 L 122 130 L 128 122 L 134 130 L 140 122 L 146 130"
      />

      {/* pectoral fin */}
      <path className="ink" d="M 112 130 L 120 148 L 134 130 Z" />

      {/* eye + monocle */}
      <circle cx="118" cy="68" r="5.5" className="brass" fill="none" />
      <circle cx="118" cy="68" r="2.8" className="brassFill" />

      {/* hull-seam + rivets */}
      <path className="brass" fill="none" strokeWidth="1.4" d="M 84 78 L 84 108" />
      <circle cx="84" cy="78" r="1.4" className="brassFill" />
      <circle cx="84" cy="108" r="1.4" className="brassFill" />

      {/* small dorsal spines */}
      <path
        className="ink thin"
        fill="none"
        d="M 100 38 L 104 30 L 110 40 M 118 36 L 122 28 L 126 36"
      />
    </svg>
  );
}

// ── Manta Ray ─────────────────────────────────────────────
// Wide diamond body, cephalic horns, whip tail, brass wing plating.
function MantaRay() {
  return (
    <svg className="manta" viewBox="0 0 320 160">
      {/* body with wide pectoral wings */}
      <path
        className="ink"
        d="M 160 30
           Q 230 36, 296 78
           Q 268 90, 232 90
           Q 198 96, 168 122
           L 160 130
           L 152 122
           Q 122 96, 88 90
           Q 52 90, 24 78
           Q 90 36, 160 30 Z"
      />

      {/* cephalic horns at the front */}
      <path className="ink thin" fill="none" d="M 150 36 Q 148 22, 152 12" />
      <path className="ink thin" fill="none" d="M 170 36 Q 172 22, 168 12" />

      {/* whip tail */}
      <path
        className="ink thin"
        fill="none"
        d="M 160 130 Q 168 142, 156 154 Q 162 158, 158 165"
      />

      {/* eye + monocle */}
      <circle cx="176" cy="66" r="5" className="brass" fill="none" />
      <circle cx="176" cy="66" r="2.4" className="brassFill" />

      {/* wing armor plates */}
      <path
        className="brass"
        d="M 56 76 L 100 80 L 96 90 L 60 88 Z"
        fill="var(--brass)" fillOpacity="0.16" strokeWidth="1"
      />
      <path
        className="brass"
        d="M 220 80 L 264 76 L 260 88 L 224 90 Z"
        fill="var(--brass)" fillOpacity="0.16" strokeWidth="1"
      />
      {[[56,76],[100,80],[220,80],[264,76]].map(([x,y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" className="brassFill" />
      ))}

      {/* gill slits */}
      <path
        className="ink thin"
        fill="none"
        d="M 160 96 L 160 104 M 168 96 L 168 104 M 176 96 L 176 104"
      />
    </svg>
  );
}

// ── Seahorse (vertical posture, drifts upward instead of horizontally) ──
function Seahorse() {
  return (
    <svg className="seah" viewBox="0 0 100 220">
      {/* head + tube snout */}
      <path
        className="ink"
        d="M 30 28
           Q 22 38, 22 52
           Q 26 64, 40 66
           Q 52 66, 56 56
           L 76 56
           L 76 48
           L 56 48
           Q 50 36, 42 30
           Q 36 24, 30 28 Z"
      />

      {/* curved S body */}
      <path
        className="ink"
        d="M 38 66
           Q 32 96, 46 116
           Q 56 138, 50 158
           Q 44 178, 60 188
           Q 76 192, 80 174
           Q 72 166, 64 164
           Q 60 150, 64 138
           Q 58 116, 54 96
           Q 50 76, 38 66 Z"
      />

      {/* coiled tail */}
      <path
        className="ink thin"
        fill="none"
        d="M 80 174 Q 86 186, 78 196 Q 70 200, 64 194"
      />

      {/* crown spines */}
      <path
        className="ink thin"
        fill="none"
        d="M 32 28 L 28 18 L 34 26 M 40 24 L 42 14 L 46 24 M 50 26 L 56 18 L 56 26"
      />

      {/* eye + monocle */}
      <circle cx="40" cy="46" r="4" className="brass" fill="none" />
      <circle cx="40" cy="46" r="2" className="brassFill" />

      {/* armor segments along the body */}
      <path className="brass" d="M 44 84 L 54 84 L 54 90 L 44 90 Z" fill="var(--brass)" fillOpacity="0.2" strokeWidth="1" />
      <path className="brass" d="M 48 108 L 60 108 L 60 116 L 48 116 Z" fill="var(--brass)" fillOpacity="0.2" strokeWidth="1" />
      <path className="brass" d="M 54 134 L 66 134 L 66 142 L 54 142 Z" fill="var(--brass)" fillOpacity="0.2" strokeWidth="1" />
      <path className="brass" d="M 56 158 L 68 158 L 68 168 L 56 168 Z" fill="var(--brass)" fillOpacity="0.2" strokeWidth="1" />

      {/* dorsal fin wave */}
      <path
        className="ink thin"
        fill="none"
        d="M 56 86 Q 64 92, 58 100 Q 68 98, 62 110"
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// Aquarium, composes the drifting set with motion-driven drift + bob.
// New: diagonal drift (verticalDrift) + depth illusion (depthRange).
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
  /** Optional. vh of vertical drift across the full horizontal pass —
   *  creates a slow diagonal travel. Positive = drifts down, negative = up. */
  verticalDrift?: number;
  /** Optional. Scale oscillation range that multiplies the base scale across
   *  the pass: [min, max]. Cycles min → max → min once per pass. Creates a
   *  depth illusion (creature approaches and recedes). */
  depthRange?: [number, number];
};

const DRIFTERS: Drifter[] = [
  // existing creatures (frequent)
  { Cmp: Jellyfish,    top: '6%',  scale: 0.75, opacity: 0.45, duration: 95,  delay: -28,  direction: 'ltr', bobAmp: 14, bobDur: 9,  verticalDrift: 8 },
  { Cmp: Siphonophore, top: '2%',  scale: 0.55, opacity: 0.40, duration: 130, delay: -70,  direction: 'rtl', bobAmp: 8,  bobDur: 7 },
  { Cmp: Squid,        top: '34%', scale: 0.65, opacity: 0.38, duration: 110, delay: -55,  direction: 'ltr', bobAmp: 18, bobDur: 11, depthRange: [0.7, 1.35] },
  { Cmp: Jellyfish,    top: '52%', scale: 0.5,  opacity: 0.32, duration: 140, delay: -100, direction: 'rtl', bobAmp: 10, bobDur: 8,  verticalDrift: -10 },
  { Cmp: Siphonophore, top: '14%', scale: 0.42, opacity: 0.30, duration: 165, delay: -40,  direction: 'ltr', bobAmp: 5,  bobDur: 6,  depthRange: [0.6, 1.4] },
  { Cmp: Squid,        top: '66%', scale: 0.45, opacity: 0.28, duration: 150, delay: -90,  direction: 'rtl', bobAmp: 12, bobDur: 10, verticalDrift: 14 },
  { Cmp: Jellyfish,    top: '76%', scale: 0.6,  opacity: 0.42, duration: 100, delay: -15,  direction: 'ltr', bobAmp: 16, bobDur: 9,  depthRange: [0.85, 1.25] },
  // rare species: long durations + heavy negative delays so they appear
  // infrequently and not all at once
  { Cmp: Shark,        top: '38%', scale: 0.5,  opacity: 0.34, duration: 220, delay: -160, direction: 'ltr', bobAmp: 4,  bobDur: 14, verticalDrift: 7 },
  { Cmp: Whale,        top: '24%', scale: 0.65, opacity: 0.32, duration: 280, delay: -210, direction: 'rtl', bobAmp: 6,  bobDur: 18, depthRange: [0.85, 1.2] },
  { Cmp: Mosasaurus,   top: '58%', scale: 0.48, opacity: 0.28, duration: 260, delay: -240, direction: 'ltr', bobAmp: 7,  bobDur: 13, verticalDrift: -8, depthRange: [0.75, 1.3] },
  // ultra-rare massive saltie — slow, heavy, deliberately oversized
  { Cmp: Croc,         top: '44%', scale: 1.05, opacity: 0.34, duration: 380, delay: -320, direction: 'rtl', bobAmp: 4,  bobDur: 22, depthRange: [0.88, 1.18] },
  // mid-tier ecosystem: angler, manta, seahorses populate the column
  { Cmp: Anglerfish,   top: '46%', scale: 0.42, opacity: 0.36, duration: 160, delay: -60,  direction: 'rtl', bobAmp: 8,  bobDur: 9,  verticalDrift: 6,  depthRange: [0.7, 1.3] },
  { Cmp: Anglerfish,   top: '82%', scale: 0.5,  opacity: 0.32, duration: 175, delay: -130, direction: 'ltr', bobAmp: 6,  bobDur: 10, verticalDrift: -5 },
  { Cmp: MantaRay,     top: '20%', scale: 0.72, opacity: 0.36, duration: 200, delay: -85,  direction: 'ltr', bobAmp: 10, bobDur: 14, depthRange: [0.6, 1.35] },
  { Cmp: MantaRay,     top: '62%', scale: 0.55, opacity: 0.30, duration: 230, delay: -180, direction: 'rtl', bobAmp: 7,  bobDur: 12, verticalDrift: 9 },
  // seahorses use the vertical axis: long verticalDrift, slow horizontal pass
  { Cmp: Seahorse,     top: '88%', scale: 0.55, opacity: 0.40, duration: 220, delay: -50,  direction: 'ltr', bobAmp: 3,  bobDur: 6,  verticalDrift: -38, depthRange: [0.8, 1.15] },
  { Cmp: Seahorse,     top: '90%', scale: 0.42, opacity: 0.34, duration: 260, delay: -170, direction: 'rtl', bobAmp: 4,  bobDur: 7,  verticalDrift: -42 },
];

// Shared drifter renderer used by both built-in DRIFTERS (SVG component
// children) and user-uploaded fish (img children). Pulls all the motion
// behavior (linear horizontal sweep, optional diagonal drift, optional
// depth-scale oscillation, bob).
function renderDrifter(
  d: Omit<Drifter, 'Cmp'>,
  key: React.Key,
  child: React.ReactNode,
) {
  const fromX = d.direction === 'ltr' ? '-30vw' : '130vw';
  const toX   = d.direction === 'ltr' ? '130vw' : '-30vw';
  const outerAnimate: { x: string; y?: string[] } = { x: toX };
  if (d.verticalDrift !== undefined) {
    outerAnimate.y = ['0vh', `${d.verticalDrift}vh`];
  }
  const depthKeyframes = d.depthRange ? [d.depthRange[0], d.depthRange[1], d.depthRange[0]] : null;
  const flip = d.direction === 'rtl' ? ' scaleX(-1)' : '';

  const inner = (
    <div style={{ transform: `scale(${d.scale})${flip}`, transformOrigin: 'top left' }}>
      {child}
    </div>
  );

  return (
    <motion.div
      key={key}
      className="drifter"
      style={{ top: d.top, opacity: d.opacity, position: 'absolute' }}
      initial={{ x: fromX, y: 0 }}
      animate={outerAnimate}
      transition={{ duration: d.duration, repeat: Infinity, ease: 'linear', delay: d.delay }}
    >
      <motion.div
        animate={{ y: [-d.bobAmp / 2, d.bobAmp / 2, -d.bobAmp / 2] }}
        transition={{ duration: d.bobDur, repeat: Infinity, ease }}
        style={{ display: 'inline-block' }}
      >
        {depthKeyframes ? (
          <motion.div
            animate={{ scale: depthKeyframes }}
            transition={{ duration: d.duration, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'inline-block', transformOrigin: 'center center' }}
          >
            {inner}
          </motion.div>
        ) : inner}
      </motion.div>
    </motion.div>
  );
}

export default function Aquarium() {
  const { fish: userFish } = useUserFish();
  return (
    <div className="aquarium" aria-hidden="true">
      {DRIFTERS.map((d, i) =>
        renderDrifter(d, `built-${i}`, <d.Cmp />),
      )}
      {userFish.map(f =>
        renderDrifter(
          {
            top: f.top,
            scale: f.scale,
            opacity: f.opacity,
            duration: f.duration,
            delay: f.delay,
            direction: f.direction,
            bobAmp: f.bobAmp,
            bobDur: f.bobDur,
            verticalDrift: f.verticalDrift,
            depthRange: f.depthRange,
          },
          f.id,
          <img src={f.dataUrl} alt="" className="userFishImg" />,
        ),
      )}
    </div>
  );
}
