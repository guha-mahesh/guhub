import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import "./Noria.css";

/**
 * A crimson field: one black tree, a perched vulture, a half-sunk water-wheel.
 * Raw buttons, almost no styling. Only the TOPICS are real; every panel body
 * is lorem placeholder for Guha to overwrite. Fixed fullscreen.
 */

// mulberry32 seeded PRNG so the tree grows the same crooked way every load.
function makeRng(seed: number) {
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

// Recursive bare tree. Grows upward from (x,y), splitting at crooked angles.
function grow(seed: number): Limb[] {
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

const LOREM_1 =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";
const LOREM_2 =
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.";
const LOREM_ITEMS = [
  "Lorem ipsum dolor sit amet",
  "Consectetur adipiscing elit sed do",
  "Eiusmod tempor incididunt ut labore",
  "Dolore magna aliqua ut enim",
];

// Only the topics are defined. Bodies are placeholder.
const SECTIONS: { key: string; label: string; body: ReactNode }[] = [
  { key: "engramme", label: "engramme", body: (<><p>{LOREM_1}</p><p>{LOREM_2}</p></>) },
  { key: "sounds", label: "sounds", body: (<><p>{LOREM_1}</p></>) },
  { key: "read", label: "read", body: (<ul className="rawlist">{LOREM_ITEMS.map((t) => <li key={t}>{t}</li>)}</ul>) },
  { key: "built", label: "built", body: (<><p>{LOREM_2}</p><ul className="rawlist">{LOREM_ITEMS.map((t) => <li key={t}>{t}</li>)}</ul></>) },
  { key: "who", label: "who", body: (<><p>{LOREM_1}</p></>) },
];

// Where the larvae sit on the tree. Hand-placed so they read as clinging.
const GRUBS = [
  { left: "43%", top: "34%", w: 128, rot: -22, flip: 1, delay: "0s", dur: "9s" },
  { left: "57%", top: "48%", w: 96, rot: 28, flip: -1, delay: "-3s", dur: "11s" },
  { left: "36%", top: "60%", w: 82, rot: -46, flip: 1, delay: "-6s", dur: "13s" },
  { left: "62%", top: "26%", w: 68, rot: 14, flip: -1, delay: "-1.5s", dur: "10s" },
  { left: "48%", top: "72%", w: 108, rot: 6, flip: 1, delay: "-8s", dur: "12s" },
];

export default function Noria() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const limbs = useMemo(() => grow(0x9a17), []);
  const open = SECTIONS.find((s) => s.key === openKey) || null;

  return (
    <div className="crim">
      {/* second colour: a thin mourning band across the top */}
      <div className="crimBand" aria-hidden />

      {/* a vulture circling overhead, top right */}
      <svg className="vulture" viewBox="0 0 240 130" aria-hidden>
        <g fill="#050505">
          {/* head + body + tail down the centre */}
          <circle cx="120" cy="34" r="7" />
          <ellipse cx="120" cy="63" rx="7.5" ry="27" />
          <path d="M112 86 L128 86 L120 106 Z" />
          {/* left wing: swept leading edge, splayed primary 'fingers' on the trailing edge */}
          <path d="M116 50 C 86 39 54 42 28 55 L 35 60 L 27 64 L 40 65 L 32 71 L 46 69 L 39 76 L 55 73 L 50 80 L 66 77 L 62 84 L 82 81 C 98 80 108 79 116 78 Z" />
          {/* right wing: the same shape mirrored about the body axis */}
          <g transform="translate(240,0) scale(-1,1)">
            <path d="M116 50 C 86 39 54 42 28 55 L 35 60 L 27 64 L 40 65 L 32 71 L 46 69 L 39 76 L 55 73 L 50 80 L 66 77 L 62 84 L 82 81 C 98 80 108 79 116 78 Z" />
          </g>
        </g>
      </svg>

      {/* an original gnawing rat, bottom-left near the roots (Rustgnawer's mood) */}
      <svg className="rat" viewBox="0 0 180 96" aria-hidden>
        <path d="M28 74 C 6 70 10 54 30 60" fill="none" stroke="#050505" strokeWidth="3.5" strokeLinecap="round" />
        <g fill="#050505">
          <path d="M42 78 C 28 72 32 50 56 46 C 82 41 118 46 136 60 C 148 69 145 79 132 81 C 104 85 62 86 42 78 Z" />
          <path d="M132 60 C 154 55 170 62 167 69 C 164 76 146 75 132 72 Z" />
          <circle cx="124" cy="50" r="9" />
          <path d="M62 82 l-3 9 M84 84 l0 9 M110 82 l3 9" fill="none" stroke="#050505" strokeWidth="3.2" strokeLinecap="round" />
        </g>
        <circle cx="152" cy="65" r="1.8" fill="#6b0a0a" />
      </svg>

      {/* Toulouse-Lautrec, Moulin Rouge / La Goulue (1891, public domain), run
          through the crimson/glitch augmentation to match the page. */}
      <img className="dancer" src="/art/lautrec_aug.png" alt="" aria-hidden="true" />

      {/* the bowler man, mirrored into one central eye. He breathes behind the tree. */}
      <img className="watcher" src="/art/watcher.png" alt="" aria-hidden="true" />

      {/* his larvae, keyed off a trading card, infesting the branches */}
      {GRUBS.map((g, i) => (
        <img
          key={i}
          className="grub"
          src="/art/grub.png"
          alt=""
          aria-hidden="true"
          style={{
            left: g.left,
            top: g.top,
            width: g.w,
            transform: `rotate(${g.rot}deg) scaleX(${g.flip})`,
            animationDelay: g.delay,
            animationDuration: g.dur,
          }}
        />
      ))}

      {/* the tree, black on crimson */}
      <svg className="tree" viewBox="-260 -520 520 540" preserveAspectRatio="xMidYMax meet" aria-hidden>
        {limbs.map((l, i) => (
          <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth={l.w} key={i} />
        ))}
      </svg>

      {/* half-sunk water wheel, turning slow */}
      <svg className="wheel" viewBox="-110 -110 220 220" aria-hidden>
        <g className="wheelSpin">
          <circle r="100" />
          <circle r="72" />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return <line x1="0" y1="0" x2={Math.cos(a) * 100} y2={Math.sin(a) * 100} key={i} />;
          })}
        </g>
      </svg>

      <header className="crimHead">
        <h1>guha</h1>
        <p className="crimSub">De hac re submisse loquere, sed non assidue.</p>
      </header>

      <nav className="crimNav">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setOpenKey(openKey === s.key ? null : s.key)}
            aria-expanded={openKey === s.key}
          >
            {openKey === s.key ? "[ " + s.label + " ]" : s.label}
          </button>
        ))}
        <a className="crimNav-exit" href="/">leave</a>
      </nav>

      {open && (
        <section className="crimPanel">
          <div className="crimPanelName">{open.label}</div>
          {open.body}
          <button className="crimClose" onClick={() => setOpenKey(null)}>close</button>
        </section>
      )}
    </div>
  );
}
