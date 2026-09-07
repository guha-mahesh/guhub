/**
 * The bird, as a panel torn out of a different book.
 *
 * When you go to the vulture the plate stops being a plate: this takes the
 * whole screen as a comic page. Cream stock, rose ink, ruled border, halftone,
 * speed lines and a lettered BANG. Rose gold is the HUE of the whole page
 * rather than the fill of the bird, which is why the paper is warm cream and
 * every line is a warm brown-rose instead of black.
 *
 * Drawn as ink linework, not as metal: contour plus hatching is what manga
 * actually does, and it is the one drawing idiom SVG is genuinely good at.
 */

const C = {
  paper: "#f2e7d5",
  paperHi: "#fbf4e7",
  ink: "#3a201a",
  inkSoft: "#6b3b30",
  rose: "#d4705c",
  roseDeep: "#a8452f",
  roseLt: "#e9a48d",
  gold: "#c98a5a",
};

/** parallel motion streaks along the dive axis */
const STREAKS = Array.from({ length: 34 }, (_, i) => {
  const t = i / 33;
  const y = -260 + t * 1180;
  const len = 300 + ((i * 137) % 520);
  const w = i % 4 === 0 ? 3.2 : i % 3 === 0 ? 1.8 : 1;
  return { y, len, w, op: 0.1 + ((i * 53) % 30) / 100 };
});

/** the jagged burst behind the lettering */
function burst(cx: number, cy: number, spikes: number, r1: number, r2: number) {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? r1 * (0.86 + ((i * 31) % 28) / 100) : r2 * (0.82 + ((i * 17) % 30) / 100);
    pts.push(`${(cx + Math.cos(a) * r * 1.5).toFixed(0)},${(cy + Math.sin(a) * r).toFixed(0)}`);
  }
  return pts.join(" ");
}

/** a run of parallel hatch strokes filling a wedge */
function hatch(x: number, y: number, n: number, step: number, len: number, ang: number) {
  const a = (ang * Math.PI) / 180;
  return Array.from({ length: n }, (_, i) => {
    const ox = x + i * step * Math.cos(a + Math.PI / 2);
    const oy = y + i * step * Math.sin(a + Math.PI / 2);
    const l = len * (1 - Math.abs(i - n / 2) / (n * 1.4));
    return `M${ox.toFixed(1)},${oy.toFixed(1)} l${(Math.cos(a) * l).toFixed(1)},${(Math.sin(a) * l).toFixed(1)}`;
  });
}


/** one quill: a long tapered leaf from an origin, bent by `curve` */
function plume(x: number, y: number, deg: number, len: number, wid: number, curve: number) {
  const a = (deg * Math.PI) / 180;
  const tx = x + Math.cos(a) * len;
  const ty = y + Math.sin(a) * len;
  const nx = -Math.sin(a), ny = Math.cos(a);
  const bx = x + Math.cos(a) * len * 0.45, by = y + Math.sin(a) * len * 0.45;
  const c1x = bx + nx * wid * curve, c1y = by + ny * wid * curve;
  const c2x = bx - nx * wid * 0.72, c2y = by - ny * wid * 0.72;
  return `M${x.toFixed(1)},${y.toFixed(1)} Q${c1x.toFixed(1)},${c1y.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} Q${c2x.toFixed(1)},${c2y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)} Z`;
}

/** a run of quills fanning from one hand point, longest in the middle */
function plumes(x: number, y: number, deg: number, n: number, wid: number, len: number, spread: number, curve: number) {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const a = deg + (t - 0.5) * spread;
    const l = len * (1 - Math.abs(t - 0.4) * 0.42);
    return plume(x, y, a, l, wid * (1 - Math.abs(t - 0.4) * 0.3), curve);
  });
}

/** the hook on the end of a toe */
function talon(x: number, y: number, deg: number) {
  const a = ((deg + 34) * Math.PI) / 180;
  const tx = x + Math.cos(a) * 44, ty = y + Math.sin(a) * 44;
  const mx = x + Math.cos((deg * Math.PI) / 180) * 26, my = y + Math.sin((deg * Math.PI) / 180) * 26;
  return `M${x.toFixed(1)},${y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} Q${(x + (tx - x) * 0.3).toFixed(1)},${(y + (ty - y) * 0.62).toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)} Z`;
}

export default function RaptorPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="mangaPage">
      <svg className="mangaArt" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <pattern id="benday" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.25" fill={C.rose} opacity="0.5" />
            <circle cx="4.5" cy="4.5" r="1.25" fill={C.rose} opacity="0.5" />
          </pattern>
          <pattern id="bendayFine" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill={C.roseDeep} opacity="0.45" />
            <circle cx="3" cy="3" r="0.8" fill={C.roseDeep} opacity="0.45" />
          </pattern>
          <radialGradient id="pageGlow" cx="0.42" cy="0.36" r="0.75">
            <stop offset="0" stopColor={C.paperHi} />
            <stop offset="0.68" stopColor={C.paper} />
            <stop offset="1" stopColor="#e2d2ba" />
          </radialGradient>
        </defs>

        {/* the stock */}
        <rect x="0" y="0" width="1200" height="800" fill="url(#pageGlow)" />

        {/* halftone weather in the top corners */}
        <path d="M0,0 L1200,0 L1200,150 C820,250 420,190 0,300 Z" fill="url(#benday)" opacity="0.55" />
        <path d="M0,800 L1200,800 L1200,690 C860,600 400,700 0,640 Z" fill="url(#bendayFine)" opacity="0.4" />

        {/* motion streaks along the dive */}
        <g className="mStreaks" transform="rotate(-24 600 400)">
          {STREAKS.map((s, i) => (
            <line
              key={i}
              x1={-260}
              y1={s.y}
              x2={-260 + s.len}
              y2={s.y}
              stroke={C.inkSoft}
              strokeWidth={s.w}
              opacity={s.op}
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* ── the burst and the lettering ── */}
        <g className="mBang">
          <polygon points={burst(830, 585, 17, 210, 128)} fill={C.rose} stroke={C.ink} strokeWidth="5" />
          <polygon points={burst(830, 585, 17, 178, 104)} fill="none" stroke={C.paperHi} strokeWidth="3" opacity="0.75" />
          <text className="mBangText mBangShadow" x="830" y="622">BANG!</text>
          <text className="mBangText mBangFace" x="826" y="617">BANG!</text>
        </g>

        {/* ── the bird, diving left and down ──
            The wing is an ARC OF OVERLAPPING FEATHERS, not a filled lozenge.
            A single smooth shape reads as a shell or a shrimp; what says bird
            is the row of separate quills each with its own outline. */}
        <g className="mBird">
          {/* far wing, behind the body, shorter and flatter */}
          <g className="mWingFar">
            {plumes(560, 356, -38, 6, 30, 176, 52, 0.9).map((d, i) => (
              <path key={i} d={d} fill={C.paper} stroke={C.ink} strokeWidth="4.5" />
            ))}
            <path d="M520,360 C572,330 632,306 692,296 C664,332 610,362 556,376 C534,382 522,374 520,360 Z"
              fill={C.paper} stroke={C.ink} strokeWidth="5" />
          </g>

          {/* tail, trailing behind the body */}
          <g className="mTail">
            {plumes(626, 396, 22, 6, 26, 142, 48, 0.95).map((d, i) => (
              <path key={i} d={d} fill={C.paper} stroke={C.ink} strokeWidth="4.5" />
            ))}
          </g>

          {/* torso */}
          <g className="mTorso">
            <path
              d="M372,438 C404,382 466,346 532,344 C596,342 638,368 644,404 C650,442 612,472 554,484 C488,498 416,480 382,460 C366,452 364,446 372,438 Z"
              fill={C.paperHi}
              stroke={C.ink}
              strokeWidth="6.5"
            />
            <path d="M402,446 C432,402 484,372 540,370 C584,368 616,384 622,410" fill="none" stroke={C.ink} strokeWidth="3.2" />
            <g stroke={C.inkSoft} strokeWidth="2.2" fill="none" opacity="0.9">
              {hatch(430, 464, 13, 8, 42, -58).map((d, i) => <path key={i} d={d} />)}
            </g>
            <path d="M524,480 C576,472 614,450 630,424" fill="none" stroke={C.roseDeep} strokeWidth="3.6" opacity="0.5" />
          </g>

          {/* near wing: nine quills sweeping up and back off the hand */}
          <g className="mWingNear">
            {/* the arm, narrow, so the quills carry the shape */}
            <path
              d="M482,376 C556,312 654,246 754,204 C776,236 770,282 736,320 C696,364 616,404 540,414 C500,418 480,400 482,376 Z"
              fill={C.paperHi}
              stroke={C.ink}
              strokeWidth="6"
            />
            {plumes(742, 214, -46, 9, 38, 252, 62, 1.05).map((d, i) => (
              <g key={i}>
                <path d={d} fill={C.paper} stroke={C.ink} strokeWidth="5" />
                <path d={d} fill="url(#benday)" opacity={i % 2 ? 0.42 : 0.22} />
              </g>
            ))}
            {/* covert row cut into the arm */}
            <g stroke={C.ink} strokeWidth="3.4" fill="none">
              <path d="M506,394 C578,338 660,282 744,238" />
              <path d="M524,410 C592,360 668,306 742,264" />
            </g>
            <g stroke={C.inkSoft} strokeWidth="2.2" fill="none" opacity="0.8">
              {hatch(560, 402, 16, 8, 58, -40).map((d, i) => <path key={i} d={d} />)}
            </g>
            {/* the one bright edge */}
            <path d="M488,370 C562,306 660,242 752,202" fill="none" stroke={C.paperHi} strokeWidth="6" opacity="0.95" />
            <path d="M494,380 C566,318 660,256 748,214" fill="none" stroke={C.gold} strokeWidth="2.8" opacity="0.7" />
          </g>

          {/* head and beak, driven down at what it is coming for */}
          <g className="mHead">
            <path d="M398,440 C374,428 356,416 344,402 C362,398 384,408 402,422 Z" fill={C.paperHi} stroke={C.ink} strokeWidth="5" />
            <ellipse cx="326" cy="428" rx="66" ry="57" fill={C.paperHi} stroke={C.ink} strokeWidth="6.5" transform="rotate(22 326 428)" />
            {/* bare skin, drawn as folds rather than as whiskers */}
            <g stroke={C.inkSoft} strokeWidth="3" fill="none" opacity="0.95" strokeLinecap="round">
              <path d="M288,394 C310,382 342,384 362,400" />
              <path d="M280,412 C304,400 336,402 358,418" />
              <path d="M286,452 C310,444 338,448 356,462" />
            </g>
            {/* the beak: the sharpest drawing on the page */}
            <path
              d="M284,450 C230,462 190,490 178,524 C208,524 244,512 276,496 C258,524 250,554 256,580 C284,562 310,522 318,484 Z"
              fill={C.paperHi}
              stroke={C.ink}
              strokeWidth="7"
            />
            <path d="M278,456 C234,468 202,492 188,520" fill="none" stroke={C.ink} strokeWidth="3.2" />
            <path d="M276,496 C258,524 250,554 256,580" fill="none" stroke={C.roseDeep} strokeWidth="3.4" opacity="0.75" />
            <ellipse cx="296" cy="464" rx="8" ry="5.5" fill={C.ink} transform="rotate(20 296 464)" />
            {/* the eye: small, hard, the only near-black on the page */}
            <circle cx="338" cy="418" r="15" fill={C.paperHi} stroke={C.ink} strokeWidth="4.5" />
            <circle cx="340" cy="419" r="7.5" fill="#1b0d0a" />
            <circle cx="336" cy="415" r="2.6" fill={C.paperHi} />
            {/* the brow is what makes it look like it means it */}
            <path d="M306,396 C328,384 358,388 378,404" fill="none" stroke={C.ink} strokeWidth="8" strokeLinecap="round" />
            {/* ruff: short broad plumes, not hairs */}
            {plumes(398, 444, 116, 5, 17, 66, 74, 0.85).map((d, i) => (
              <path key={i} d={d} fill={C.paper} stroke={C.ink} strokeWidth="4" />
            ))}
          </g>

          {/* the grip, thrown forward ahead of the dive */}
          <g className="mGrip">
            <path d="M430,472 C426,512 410,550 382,580 L422,598 C452,566 470,526 476,488 Z" fill={C.paperHi} stroke={C.ink} strokeWidth="6" />
            <g stroke={C.ink} strokeWidth="2.6" fill="none">
              {[0, 1, 2, 3, 4].map(i => (
                <path key={i} d={`M${426 - i * 5},${496 + i * 16} q 20 8 40 2`} />
              ))}
            </g>
            {/* three toes forward, one back, each a clean tapered shape */}
            {[
              { a: 196, l: 132, w: 19 },
              { a: 222, l: 148, w: 21 },
              { a: 250, l: 128, w: 18 },
              { a: 40, l: 96, w: 16 },
            ].map((t, i) => (
              <g key={i}>
                <path d={plume(408, 588, t.a, t.l, t.w, 0.9)} fill={C.paperHi} stroke={C.ink} strokeWidth="5.5" />
                <path d={plume(408, 588, t.a, t.l * 0.55, t.w * 0.6, 0.9)} fill="none" stroke={C.ink} strokeWidth="2.4" />
                {/* the talon, hooked off the toe tip */}
                <path
                  d={talon(408 + Math.cos((t.a * Math.PI) / 180) * t.l, 588 + Math.sin((t.a * Math.PI) / 180) * t.l, t.a)}
                  fill={C.paperHi}
                  stroke={C.ink}
                  strokeWidth="4.5"
                />
              </g>
            ))}
          </g>
        </g>

        {/* ── the page furniture: ruled border, like the book ── */}
        <rect x="16" y="16" width="1168" height="768" fill="none" stroke={C.rose} strokeWidth="26" />
        <rect x="16" y="16" width="1168" height="768" fill="none" stroke={C.ink} strokeWidth="4" />
        <rect x="42" y="42" width="1116" height="716" fill="none" stroke={C.ink} strokeWidth="3" />
      </svg>

      <button className="mangaClose" onClick={onClose}>
        close the book
      </button>
    </div>
  );
}
