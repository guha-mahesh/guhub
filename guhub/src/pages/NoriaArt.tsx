/**
 * The scene's objects, each drawn in isolation and knowing nothing about
 * the world it will be placed in. Pure black on crimson, no gradients:
 * shading is the dither layer's job, and distance is handled with flat
 * opacity rather than blur, so nothing in the frame is ever mushy.
 *
 * Noria.tsx is the orchestrator that positions and wires these up.
 */

// mulberry32, so anything procedural draws the same way every load.
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Limb = { x1: number; y1: number; x2: number; y2: number; w: number };

function growLimbs(seed: number): Limb[] {
  const rng = makeRng(seed);
  const limbs: Limb[] = [];
  function branch(x: number, y: number, angle: number, len: number, w: number, depth: number) {
    if (depth > 9 || len < 6) return;
    const sway = (rng() - 0.5) * 0.5;
    const x2 = x + Math.cos(angle + sway) * len;
    const y2 = y + Math.sin(angle + sway) * len;
    limbs.push({ x1: x, y1: y, x2, y2, w });
    const forks = rng() < 0.28 ? 3 : 2;
    for (let i = 0; i < forks; i++) {
      const spread = (i - (forks - 1) / 2) * (0.4 + rng() * 0.4);
      branch(x2, y2, angle + spread + (rng() - 0.5) * 0.2, len * (0.72 + rng() * 0.12), Math.max(0.6, w * 0.68), depth + 1);
    }
  }
  branch(0, 0, -Math.PI / 2, 78, 9, 0);
  return limbs;
}

/**
 * The tree. A swollen, knotted trunk rather than a stick: the silhouette
 * carries the menace, so the branches stay bare. A hollow sits at the base.
 */
export function DeadTree({ seed = 0x9a17 }: { seed?: number }) {
  const limbs = growLimbs(seed);
  return (
    <svg className="art artTree" viewBox="-260 -540 520 620" aria-hidden>
      <g fill="#0c0606">
        {/* trunk: wider at the foot, pinching at the crown, buttressed roots */}
        <path d="M-16 -300 C -26 -200 -34 -110 -44 -30 C -52 20 -76 46 -108 56 L -108 72 L 112 72 L 112 56 C 78 46 54 20 46 -30 C 36 -110 26 -200 16 -300 Z" />
        {/* root flares reaching out of frame */}
        <path d="M-104 60 C -140 58 -180 66 -214 62 L -214 72 L -104 72 Z" />
        <path d="M108 60 C 146 58 186 66 220 62 L 220 72 L 108 72 Z" />
      </g>
      <g stroke="#0c0606" fill="none" strokeLinecap="round">
        {limbs.map((l, i) => (
          <line x1={l.x1} y1={l.y1 - 290} x2={l.x2} y2={l.y2 - 290} strokeWidth={l.w} key={i} />
        ))}
      </g>
    </svg>
  );
}

/** The hollow at the tree's foot. Small, dark, and clearly a way in. */
export function Hollow() {
  return (
    <svg className="art artHollow" viewBox="-40 -46 80 56" aria-hidden>
      {/* the opening itself, a hole in the trunk's black: crimson shows through */}
      <path d="M-22 8 C -26 -18 -12 -36 0 -36 C 12 -36 26 -18 22 8 Z" fill="#6b0a0a" />
      {/* the dark inside it, so the hole reads as depth not as a cut-out */}
      <path d="M-15 8 C -18 -14 -8 -28 0 -28 C 8 -28 18 -14 15 8 Z" fill="#0c0606" />
      {/* splintered lip */}
      <g stroke="#0c0606" strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path d="M-22 8 C -18 -20 -10 -33 0 -34" />
        <path d="M22 8 C 18 -20 10 -33 0 -34" />
      </g>
    </svg>
  );
}

/** The wheel: paddles on the rim, hub, and the arms between. */
export function Waterwheel() {
  return (
    <svg className="art artWheel" viewBox="-124 -124 248 248" aria-hidden>
      <g className="wheelSpin">
        <g stroke="#0c0606" fill="none" strokeWidth="5">
          <circle r="104" />
          <circle r="74" />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 18} y1={Math.sin(a) * 18} x2={Math.cos(a) * 104} y2={Math.sin(a) * 104} />;
          })}
        </g>
        <g fill="#0c0606">
          <circle r="18" />
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={i} x="-10" y="-118" width="20" height="24" transform={`rotate(${(i / 16) * 360})`} />
          ))}
        </g>
      </g>
    </svg>
  );
}

/**
 * Where the water is thrown off the paddles. Drops arc up and fall back,
 * each on its own offset, so the throw never reads as a loop.
 */
export function Splash() {
  const drops = Array.from({ length: 16 }).map((_, i) => {
    const rng = makeRng(0x2200 + i);
    return { x: -60 + rng() * 120, d: rng() * 2.4, s: 0.6 + rng() * 0.9 };
  });
  return (
    <div className="art artSplash" aria-hidden>
      {drops.map((d, i) => (
        <span
          key={i}
          className="drop"
          style={{ left: `${d.x}px`, animationDelay: `${-d.d}s`, transform: `scale(${d.s})` }}
        />
      ))}
    </div>
  );
}

/**
 * The factory: a long shed venting into the river through an outfall pipe.
 * Kept low and wide so it never fights the wheel for the eye.
 */
export function Factory() {
  return (
    <svg className="art artFactory" viewBox="0 0 620 340" aria-hidden>
      <g fill="#0c0606">
        <path d="M150 340 L150 176 L430 176 L430 340 Z" />
        <path d="M150 176 L184 138 L218 176 L252 138 L286 176 L320 138 L354 176 L388 138 L422 176 Z" />
        <path d="M236 138 L236 26 L268 26 L268 138 Z" />
        <path d="M312 138 L312 74 L334 74 L334 138 Z" />
        <path d="M430 340 L430 236 L536 236 L536 340 Z" />
        <path d="M96 264 L150 264 L150 282 L96 282 Z" />
        <path d="M70 232 L96 232 L96 340 L70 340 Z" />
        {/* the outfall: pipe stepping down to the waterline */}
        <path d="M96 300 L40 300 L40 322 L96 322 Z" />
        <path d="M40 310 L4 310 L4 330 L40 330 Z" />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={176 + i * 40} y="212" width="20" height="28" />
        ))}
        <rect x="452" y="266" width="18" height="24" />
        <rect x="486" y="266" width="18" height="24" />
      </g>
    </svg>
  );
}

/** What the factory puts into the river, running out of the outfall pipe. */
export function Effluent() {
  return (
    <div className="art artEffluent" aria-hidden>
      <svg viewBox="0 0 220 90" preserveAspectRatio="none">
        <g fill="#0c0606">
          {Array.from({ length: 5 }).map((_, row) => (
            <g key={row} className="effRow" style={{ animationDelay: `${-row * 1.1}s` }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <ellipse key={i} cx={12 + i * 32} cy={14 + row * 16} rx={11 - row} ry={3.4} opacity={0.85 - row * 0.13} />
              ))}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

/** Stipple smoke off a stack. */
export function Smoke({ delay = 0 }: { delay?: number }) {
  return (
    <div className="art artSmoke" style={{ animationDelay: `${delay}s` }} aria-hidden>
      <svg viewBox="-40 -170 80 190">
        <g fill="#0c0606">
          {Array.from({ length: 20 }).map((_, i) => {
            const t = i / 20;
            return (
              <circle
                key={i}
                cx={Math.sin(t * 6.1) * (6 + t * 24)}
                cy={-t * 158}
                r={2 + t * 8}
                opacity={0.5 - t * 0.42}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

/**
 * The river, drawn flat and laid on the ground plane. It runs in wide from
 * the right, takes the outfall, then pinches into the race that drives the
 * wheel. The pinch is the point: the whole flow is forced through it.
 */
export function River() {
  return (
    <svg className="art artRiver" viewBox="0 0 1600 700" preserveAspectRatio="none" aria-hidden>
      {/* the water: lighter than the bank it cuts through, so it reads as
          surface rather than as an object lying on the ground */}
      <path
        className="body"
        d="M1600 40 L1600 660 L900 596 C 790 584 742 500 700 430 C 664 372 622 356 540 356 L-40 356 L-40 300 L540 300 C 628 300 668 282 704 226 C 748 158 796 76 900 62 Z"
      />
      {/* the darker lip where the bank drops to the water */}
      <path
        className="lip"
        d="M-40 292 L540 292 C 628 292 668 274 704 218 C 748 150 796 68 900 54 L1600 32 L1600 44 L904 66 C 802 80 754 162 710 230 C 674 286 632 304 540 304 L-40 304 Z"
      />
      {/* current lines, quickening as the channel narrows */}
      <g stroke="#6b0a0a" fill="none" strokeLinecap="round" strokeWidth="5">
        {Array.from({ length: 7 }).map((_, i) => (
          <path
            key={i}
            className="current"
            style={{ animationDelay: `${-i * 0.55}s` }}
            d={`M1560 ${170 + i * 52} C 1200 ${190 + i * 46} 980 ${250 + i * 20} 820 ${300 + i * 6} C 700 ${318 + i * 2} 560 318 120 318`}
            opacity={0.5 - i * 0.045}
          />
        ))}
      </g>
    </svg>
  );
}

/** A ridge line. Flat black, no blur: distance is carried by opacity alone. */
export function Ridge({ seed, width = 900, height = 200 }: { seed: number; width?: number; height?: number }) {
  const rng = makeRng(seed);
  // few, broad summits rather than a sawtooth: a chart line is not a hill
  const steps = 7;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = height - (0.28 + rng() * 0.72) * height * 0.62;
    pts.push([x, y]);
  }
  // smooth the crest with quadratics through the midpoints
  let d = `M0 ${height} L${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    d += ` Q${px.toFixed(1)} ${py.toFixed(1)} ${((px + cx) / 2).toFixed(1)} ${((py + cy) / 2).toFixed(1)}`;
  }
  d += ` L${width} ${pts[steps][1].toFixed(1)} L${width} ${height}`;

  // hatching hung off the crest, thinning as it falls away
  const hatch: string[] = [];
  const N = 90;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = t * width;
    const seg = Math.min(steps - 1, Math.floor(t * steps));
    const local = t * steps - seg;
    const y = pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * local;
    hatch.push(`M${x.toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(y + 6 + ((i * 7) % 23)).toFixed(1)}`);
  }

  return (
    <svg className="art artRidge" viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path className="ridgeLine" d={d} />
      <g className="ridgeHatch">{hatch.map((h, i) => <path key={i} d={h} />)}</g>
    </svg>
  );
}

export function Vulture() {
  return (
    <svg className="art artVulture" viewBox="0 0 240 130" aria-hidden>
      <g fill="#0c0606">
        <circle cx="120" cy="34" r="7" />
        <ellipse cx="120" cy="63" rx="7.5" ry="27" />
        <path d="M112 86 L128 86 L120 106 Z" />
        <path d="M116 50 C 86 39 54 42 28 55 L 35 60 L 27 64 L 40 65 L 32 71 L 46 69 L 39 76 L 55 73 L 50 80 L 66 77 L 62 84 L 82 81 C 98 80 108 79 116 78 Z" />
        <g transform="translate(240,0) scale(-1,1)">
          <path d="M116 50 C 86 39 54 42 28 55 L 35 60 L 27 64 L 40 65 L 32 71 L 46 69 L 39 76 L 55 73 L 50 80 L 66 77 L 62 84 L 82 81 C 98 80 108 79 116 78 Z" />
        </g>
      </g>
    </svg>
  );
}

/**
 * The observer in the foreground, back to us, writing. He holds the pen
 * backwards, nib up, and writes with the wrong end. He does not stop.
 */
export function Scribe() {
  return (
    <svg className="art artScribe" viewBox="-90 -190 180 200" aria-hidden>
      <g fill="#0c0606">
        {/* coat, seen from behind, hem broken by the ground */}
        <path d="M-46 10 C -50 -60 -40 -104 -22 -120 L 22 -120 C 40 -104 50 -60 46 10 Z" />
        {/* head and collar */}
        <path d="M-20 -120 C -20 -134 -14 -142 0 -142 C 14 -142 20 -134 20 -120 Z" />
        <ellipse cx="0" cy="-158" rx="21" ry="23" />
        {/* the shoulder and arm that does the writing */}
        <path d="M28 -112 C 48 -104 58 -84 56 -64 L 40 -62 C 40 -80 34 -92 22 -98 Z" />
      </g>
      {/* the notebook, held low and to the right */}
      <g className="scribeHand">
        <rect x="34" y="-74" width="46" height="34" fill="#0c0606" />
        <g stroke="#6b0a0a" strokeWidth="2" fill="none">
          <path d="M40 -64 L74 -64 M40 -56 L74 -56 M40 -48 L66 -48" />
        </g>
        {/* the pen, nib pointing up and away from the page */}
        <g className="scribePen">
          <rect x="52" y="-104" width="4.5" height="30" fill="#0c0606" transform="rotate(14 54 -90)" />
          <path d="M56 -106 L62 -114 L58 -100 Z" fill="#0c0606" transform="rotate(14 54 -90)" />
        </g>
      </g>
    </svg>
  );
}

/** A squirrel hunched over a nut at the tree's foot, working at it. */
export function Squirrel() {
  return (
    <svg className="art artSquirrel" viewBox="-60 -70 130 90" aria-hidden>
      <g fill="#0c0606">
        <path d="M18 4 C 44 6 58 -12 54 -34 C 51 -52 36 -60 22 -55 C 34 -50 42 -40 40 -28 C 38 -14 28 -6 14 -6 Z" />
        <ellipse cx="6" cy="-12" rx="20" ry="18" />
        <path d="M-8 6 L 22 6 L 20 -4 L -6 -4 Z" />
        <g className="squirrelHead">
          <ellipse cx="-18" cy="-20" rx="12" ry="10.5" />
          <path d="M-28 -22 L -38 -18 L -28 -14 Z" />
          <path d="M-14 -30 C -18 -38 -8 -40 -8 -32 Z" />
          <circle cx="-22" cy="-22" r="1.6" fill="#6b0a0a" />
          <path d="M-22 -10 L -30 -6 L -26 -3 L -18 -7 Z" />
        </g>
        <ellipse cx="-32" cy="-6" rx="5" ry="6" />
        <circle cx="-42" cy="0" r="1.4" opacity="0.8" />
        <circle cx="-37" cy="2" r="1.1" opacity="0.7" />
        <path d="M2 4 L 18 4 L 20 8 L 0 8 Z" />
      </g>
    </svg>
  );
}

/* ── interiors: only drawn once the camera has come to look ─────────── */

/** Bark hatching and roots. Worth drawing only from close up. */
export function TrunkDetail() {
  const hatch = Array.from({ length: 40 }).map((_, i) => ({
    y: -270 + i * 7,
    bow: Math.sin(i * 0.6) * 5,
    len: 16 + ((i * 11) % 18),
  }));
  return (
    <svg className="art artTrunkDetail" viewBox="-130 -300 260 380" aria-hidden>
      <g stroke="#6b0a0a" fill="none" strokeLinecap="round" opacity="0.8">
        {hatch.map((h, i) => (
          <path key={i} d={`M${-18 + h.bow} ${h.y} q 7 5 ${h.len * 0.5} 1`} strokeWidth={i % 4 === 0 ? 2.4 : 1.2} />
        ))}
        {/* knot */}
        <ellipse cx="24" cy="-150" rx="13" ry="20" strokeWidth="2.2" />
        <ellipse cx="24" cy="-150" rx="6" ry="10" strokeWidth="1.6" />
      </g>
      <g stroke="#0c0606" fill="none" strokeLinecap="round">
        <path d="M-10 40 C -46 46 -78 58 -116 54" strokeWidth="8" />
        <path d="M4 44 C 34 54 74 56 114 48" strokeWidth="7" />
        <path d="M-4 48 C -18 62 -36 72 -60 74" strokeWidth="4.5" />
      </g>
    </svg>
  );
}

/** A beetle, going somewhere with purpose. */
export function Beetle() {
  return (
    <svg className="art artBeetle" viewBox="-24 -14 48 28" aria-hidden>
      <g fill="#0c0606">
        <ellipse cx="0" cy="0" rx="14" ry="8.5" />
        <ellipse cx="-13" cy="0" rx="5" ry="4.5" />
        <rect x="-1.2" y="-8" width="2.4" height="16" fill="#6b0a0a" />
      </g>
      <g stroke="#0c0606" strokeWidth="1.6" strokeLinecap="round" className="beetleLegs">
        <path d="M-6 6 L -10 12 M0 8 L 0 14 M6 6 L 10 12" />
        <path d="M-6 -6 L -10 -12 M0 -8 L 0 -14 M6 -6 L 10 -12" />
        <path d="M-16 -3 L -22 -8 M-16 3 L -22 8" />
      </g>
    </svg>
  );
}

/** A cluster of caps pushing out of the wet side of the trunk. */
export function Mushrooms() {
  return (
    <svg className="art artMushrooms" viewBox="-60 -46 120 56" aria-hidden>
      <g fill="#0c0606">
        <path d="M-46 -8 q 16 -22 32 0 Z" /><rect x="-33" y="-8" width="6" height="14" />
        <path d="M-16 -2 q 12 -17 24 0 Z" /><rect x="-6" y="-2" width="5" height="11" />
        <path d="M12 -14 q 14 -19 28 0 Z" /><rect x="23" y="-14" width="5" height="20" />
        <ellipse cx="-40" cy="8" rx="9" ry="2.4" opacity="0.5" />
        <ellipse cx="26" cy="8" rx="8" ry="2.2" opacity="0.5" />
      </g>
    </svg>
  );
}

/** A moth working the same patch of air, over and over. */
export function Moth() {
  return (
    <svg className="art artMoth" viewBox="-20 -14 40 28" aria-hidden>
      <g fill="#0c0606">
        <ellipse cx="0" cy="0" rx="3" ry="7" />
        <g className="mothWingL"><path d="M-2 -4 C -16 -14 -20 -2 -12 6 C -8 9 -4 6 -2 2 Z" /></g>
        <g className="mothWingR"><path d="M2 -4 C 16 -14 20 -2 12 6 C 8 9 4 6 2 2 Z" /></g>
      </g>
    </svg>
  );
}

/** Inside the shed: gears, a piston, and vats that keep filling. */
export function FactoryGuts() {
  return (
    <svg className="art artGuts" viewBox="-180 -120 360 240" aria-hidden>
      {/* two meshed gears */}
      <g className="gutsGearA" transform="translate(-96 -20)">
        <g fill="#0c0606">
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={i} x="-4" y="-48" width="8" height="13" transform={`rotate(${(i / 14) * 360})`} />
          ))}
          <circle r="37" />
          <circle r="9" fill="#6b0a0a" />
        </g>
      </g>
      <g className="gutsGearB" transform="translate(-16 -20)">
        <g fill="#0c0606">
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x="-3.4" y="-34" width="6.8" height="11" transform={`rotate(${(i / 10) * 360})`} />
          ))}
          <circle r="25" />
          <circle r="7" fill="#6b0a0a" />
        </g>
      </g>
      {/* piston driven off the small gear */}
      <g className="gutsPiston">
        <rect x="12" y="-26" width="86" height="12" fill="#0c0606" />
        <rect x="92" y="-34" width="26" height="28" fill="#0c0606" />
      </g>
      <g fill="#0c0606">
        <rect x="118" y="-40" width="14" height="40" />
        {/* vats, filling and never emptying */}
        <path d="M22 44 L 78 44 L 70 96 L 30 96 Z" />
        <path d="M96 44 L 152 44 L 144 96 L 104 96 Z" />
      </g>
      <g fill="#6b0a0a">
        <rect className="gutsLevelA" x="30" y="58" width="40" height="30" />
        <rect className="gutsLevelB" x="104" y="66" width="40" height="22" />
      </g>
    </svg>
  );
}

/* ── things too large to resolve ─────────────────────────────────────
   Subnautica's trick, borrowed: you register the size before you
   register the shape. These sit far back, barely separated in tone
   from the sky, and move slowly enough that you doubt they moved.  */

/** A second noria. The familiar object, at a scale that is not. */
export function GreatWheel() {
  const spokes = 28;
  return (
    <svg className="art artGreatWheel" viewBox="-320 -320 640 640" aria-hidden>
      <g className="greatSpin" fill="none" stroke="currentColor">
        <circle r="300" strokeWidth="14" />
        <circle r="252" strokeWidth="7" />
        <circle r="96" strokeWidth="10" />
        {Array.from({ length: spokes }).map((_, i) => {
          const a = (i / spokes) * Math.PI * 2;
          return (
            <line key={i} strokeWidth="6"
              x1={Math.cos(a) * 96} y1={Math.sin(a) * 96}
              x2={Math.cos(a) * 300} y2={Math.sin(a) * 300} />
          );
        })}
        <g stroke="none" fill="currentColor">
          {Array.from({ length: spokes }).map((_, i) => (
            <rect key={i} x="-22" y="-322" width="44" height="52" transform={`rotate(${(i / spokes) * 360})`} />
          ))}
        </g>
      </g>
    </svg>
  );
}

/**
 * Something standing in the haze. Read as a trunk, a leg, a tower or a
 * limb depending on how long you look, which is the point: it is never
 * given enough edge to settle into one of them.
 */
export function Colossus() {
  return (
    <svg className="art artColossus" viewBox="-200 -700 400 760" aria-hidden>
      <g fill="currentColor">
        {/* the shaft, leaving the frame at the top */}
        <path d="M-58 60 C -76 -140 -92 -360 -70 -700 L 74 -700 C 96 -360 82 -140 62 60 Z" />
        {/* whatever it rests on, spreading wide and low */}
        <path d="M-150 60 C -120 6 -88 -14 -58 -18 L 62 -18 C 92 -14 124 6 154 60 Z" />
        {/* a second shaft further back, only just separable from it */}
        <path d="M96 60 C 84 -180 92 -420 108 -700 L 176 -700 C 168 -420 160 -180 168 60 Z" opacity="0.55" />
      </g>
    </svg>
  );
}

/** A long back breaking the water. Never the whole animal. */
export function DeepMass() {
  return (
    <svg className="art artDeepMass" viewBox="-300 -60 600 90" aria-hidden>
      <g fill="currentColor">
        <path d="M-280 26 C -190 -14 -80 -34 20 -32 C 130 -30 226 -10 288 26 Z" />
        {/* ridges along the spine, the only part with any edge to it */}
        <path d="M-108 -26 L -84 -50 L -60 -25 Z" />
        <path d="M-30 -32 L -2 -60 L 26 -31 Z" />
        <path d="M62 -28 L 84 -48 L 106 -26 Z" />
      </g>
    </svg>
  );
}
