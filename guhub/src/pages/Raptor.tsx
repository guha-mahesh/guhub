/**
 * The bird, close up. A freeze frame.
 *
 * Deliberately a POSTER, not an anatomical study. Anatomical realism in SVG
 * needs hundreds of shapes and falls apart if any of them is slightly wrong;
 * a bold silhouette with a dozen confident shapes reads as intentional and
 * cannot fall apart the same way. So: two swept wings caught mid-beat, one
 * up and one down, a clean body, a hooked head, and the grip.
 *
 * The metal comes from four things on every surface: a dark core, a mid tone,
 * a hard specular streak, and a rim light. Miss the specular and it reads as
 * plastic.
 */

const M = {
  spec: "#fff6f0",
  hi: "#ffcdb6",
  mid: "#f09f80",
  rose: "#d97a5e",
  deep: "#a8523c",
  shade: "#6b2c20",
  core: "#2a0f0b",
};

/** finger slots at a wingtip: the notches that make a raptor read as a raptor */
function slots(cx: number, cy: number, dir: number, n: number, spread: number, len: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = ((dir + (i - (n - 1) / 2) * spread) * Math.PI) / 180;
    const l = len * (1 - Math.abs(i - (n - 1) / 2) * 0.09);
    const w = 17 - Math.abs(i - (n - 1) / 2) * 1.6;
    const tx = cx + Math.cos(a) * l;
    const ty = cy + Math.sin(a) * l;
    const nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
    return `M${cx + nx},${cy + ny} Q${(cx + tx) / 2 + nx * 0.7},${(cy + ty) / 2 + ny * 0.7} ${tx},${ty} Q${(cx + tx) / 2 - nx * 0.7},${(cy + ty) / 2 - ny * 0.7} ${cx - nx},${cy - ny} Z`;
  });
}

export default function Raptor() {
  return (
    <svg className="artRaptor" viewBox="-520 -340 1040 700" aria-hidden>
      <defs>
        <linearGradient id="rUp" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={M.spec} />
          <stop offset="0.18" stopColor={M.hi} />
          <stop offset="0.52" stopColor={M.mid} />
          <stop offset="0.82" stopColor={M.deep} />
          <stop offset="1" stopColor={M.shade} />
        </linearGradient>
        <linearGradient id="rDown" x1="0.8" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor={M.mid} />
          <stop offset="0.4" stopColor={M.rose} />
          <stop offset="0.78" stopColor={M.shade} />
          <stop offset="1" stopColor={M.core} />
        </linearGradient>
        <linearGradient id="rTorso" x1="0.15" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor={M.hi} />
          <stop offset="0.34" stopColor={M.mid} />
          <stop offset="0.72" stopColor={M.deep} />
          <stop offset="1" stopColor={M.shade} />
        </linearGradient>
        <linearGradient id="rSkull" x1="0.1" y1="0" x2="0.75" y2="1">
          <stop offset="0" stopColor={M.spec} />
          <stop offset="0.3" stopColor={M.hi} />
          <stop offset="0.75" stopColor={M.rose} />
          <stop offset="1" stopColor={M.shade} />
        </linearGradient>
      </defs>

      {/* ── the word, struck across the frame behind the bird ── */}
      <g className="rBang" transform="rotate(-11 -30 -140)">
        <text className="rBangOut" x="-380" y="-70">BANG!</text>
        <text className="rBangIn" x="-380" y="-70">BANG!</text>
      </g>

      {/* ── the down wing, far side: darker, behind everything ── */}
      <g className="rWingDown">
        {slots(-212, 122, 156, 7, 11, 150).map((d, i) => (
          <path key={i} d={d} fill="url(#rDown)" stroke={M.core} strokeWidth="2" />
        ))}
        <path
          d="M6,-6 C-56,32 -140,86 -240,140 C-206,176 -140,178 -76,150 C-30,130 4,86 18,40 Z"
          fill="url(#rDown)"
          stroke={M.core}
          strokeWidth="3"
        />
        <path d="M2,4 C-54,40 -132,90 -226,140" fill="none" stroke={M.mid} strokeWidth="4" opacity="0.5" />
      </g>

      {/* ── tail, swept back ── */}
      <g className="rTail">
        {slots(166, 78, 26, 7, 10, 132).map((d, i) => (
          <path key={i} d={d} fill="url(#rUp)" stroke={M.core} strokeWidth="2" />
        ))}
      </g>

      {/* ── torso ── */}
      <g className="rTorso">
        <path
          d="M-52,-62 C10,-70 84,-40 148,20 C186,56 200,88 186,102 C170,118 130,110 88,84 C36,52 -8,4 -40,-32 C-56,-50 -60,-58 -52,-62 Z"
          fill="url(#rTorso)"
          stroke={M.core}
          strokeWidth="3"
        />
        {/* breast plumage: three broad shapes, never a grid */}
        <path d="M-30,-46 C22,-48 78,-20 130,30 C154,54 162,74 152,82 C138,92 106,80 72,56 C30,26 -6,-12 -30,-40 Z" fill={M.rose} opacity="0.42" />
        <path d="M-16,-34 C28,-32 70,-8 108,28" fill="none" stroke={M.spec} strokeWidth="6" strokeLinecap="round" opacity="0.72" />
        <path d="M-4,-16 C34,-10 68,12 96,42" fill="none" stroke={M.hi} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      </g>

      {/* ── the up wing, near side: the hero shape ── */}
      <g className="rWingUp">
        <path
          d="M-30,-58 C34,-108 128,-176 226,-238 C268,-208 276,-142 244,-78 C214,-18 146,22 78,16 C24,12 -14,-20 -30,-58 Z"
          fill="url(#rUp)"
          stroke={M.core}
          strokeWidth="3"
        />
        {slots(196, -196, 300, 7, 11, 178).map((d, i) => (
          <path key={i} d={d} fill="url(#rUp)" stroke={M.core} strokeWidth="2" />
        ))}
        {/* covert row, cutting into the mass rather than sitting on it */}
        <path
          d="M-16,-56 C40,-98 122,-158 208,-212 C238,-186 240,-140 216,-96"
          fill="none"
          stroke={M.core}
          strokeWidth="2.4"
          opacity="0.5"
        />
        {/* the specular streak: this is the whole trick */}
        <path
          d="M-8,-64 C50,-108 130,-166 214,-224"
          fill="none"
          stroke={M.spec}
          strokeWidth="9"
          strokeLinecap="round"
          opacity="0.88"
        />
        <path d="M14,-40 C68,-80 138,-132 206,-184" fill="none" stroke={M.hi} strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      </g>

      {/* ── head, turned to look down at what it has ── */}
      <g className="rHead">
        <path d="M-38,-56 C-58,-70 -74,-84 -82,-98 C-64,-96 -46,-88 -34,-74 Z" fill="url(#rTorso)" stroke={M.core} strokeWidth="2" />
        <ellipse cx="-92" cy="-104" rx="52" ry="45" fill="url(#rSkull)" stroke={M.core} strokeWidth="3" transform="rotate(-18 -92 -104)" />
        {/* the beak: heavy, hooked, brightest metal in the frame */}
        <path
          d="M-128,-122 C-176,-128 -212,-112 -224,-86 C-200,-86 -170,-92 -144,-100 C-160,-80 -168,-58 -166,-40 C-142,-52 -118,-78 -108,-104 Z"
          fill="url(#rSkull)"
          stroke={M.core}
          strokeWidth="3"
        />
        <path d="M-132,-116 C-176,-120 -204,-106 -214,-88" fill="none" stroke={M.spec} strokeWidth="4" opacity="0.9" />
        <circle cx="-126" cy="-104" r="4.5" fill={M.shade} />
        <circle cx="-100" cy="-118" r="8" fill={M.core} />
        <circle cx="-100" cy="-118" r="8" fill="none" stroke={M.spec} strokeWidth="2.4" />
        <circle cx="-102.5" cy="-120.5" r="2.6" fill={M.spec} />
        {/* a heavy brow ridge over the eye */}
        <path d="M-118,-132 C-106,-140 -90,-140 -78,-132 C-90,-136 -106,-136 -118,-132 Z" fill={M.core} opacity="0.85" />
        <path d="M-120,-130 C-106,-142 -86,-142 -74,-130" fill="none" stroke={M.core} strokeWidth="5" opacity="0.6" />
        {/* ruff where the bare neck meets the plumage */}
        {slots(-52, -62, 70, 5, 22, 44).map((d, i) => (
          <path key={i} d={d} fill={M.deep} stroke={M.core} strokeWidth="1.8" />
        ))}
      </g>

      {/* ── the grip ── */}
      <g className="rGrip">
        <path d="M62,66 C50,102 34,134 12,158 L44,172 C68,144 86,110 96,80 Z" fill="url(#rTorso)" stroke={M.core} strokeWidth="2.5" />
        {[0, 1, 2, 3, 4].map(i => (
          <path key={i} d={`M${44 - i * 7},${100 + i * 12} q 16 7 32 1`} fill="none" stroke={M.hi} strokeWidth="2.4" opacity={0.7 - i * 0.08} />
        ))}

        {/* the mouse: a clean silhouette so it reads at a glance */}
        <g className="rPrey">
          <path
            d="M-44,196 C-8,182 40,186 66,206 C84,220 78,244 50,250 C14,258 -30,242 -46,220 Z"
            fill={M.shade}
            stroke={M.core}
            strokeWidth="2.5"
          />
          <ellipse cx="-56" cy="210" rx="20" ry="17" fill={M.deep} stroke={M.core} strokeWidth="2.5" />
          <ellipse cx="-68" cy="196" rx="9" ry="10" fill={M.shade} stroke={M.core} strokeWidth="2" />
          <circle cx="-64" cy="212" r="3.2" fill={M.core} />
          <path d="M-74,218 C-92,224 -108,222 -120,214" fill="none" stroke={M.mid} strokeWidth="1.6" opacity="0.7" />
          <path d="M-74,224 C-92,232 -110,232 -124,226" fill="none" stroke={M.mid} strokeWidth="1.4" opacity="0.55" />
          <path d="M66,236 C104,252 148,246 178,218" fill="none" stroke={M.shade} strokeWidth="8" strokeLinecap="round" />
          <path d="M66,236 C104,252 148,246 178,218" fill="none" stroke={M.core} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="6 8" />
        </g>

        {/* toes closing over the prey, points turned inward */}
        {[
          "M28,158 C10,180 -14,196 -42,200 C-28,214 -6,210 16,196 C32,186 40,170 40,160 Z",
          "M50,166 C44,196 30,222 8,240 C30,240 50,226 62,204 C72,186 68,170 60,164 Z",
          "M4,168 C-18,186 -46,198 -76,200 C-62,216 -36,212 -12,200 C2,192 8,178 8,170 Z",
          "M72,168 C78,196 74,224 60,248 C80,240 94,220 100,196 C104,178 90,166 80,164 Z",
        ].map((d, i) => (
          <g key={i}>
            <path d={d} fill="url(#rTorso)" stroke={M.core} strokeWidth="2.5" />
            <path d={d} fill="none" stroke={M.spec} strokeWidth="1.6" opacity="0.4" />
          </g>
        ))}
        {[
          "M-42,200 C-58,206 -70,216 -74,228 C-62,224 -48,214 -38,206 Z",
          "M8,240 C-2,252 -6,266 -2,278 C8,266 14,252 16,242 Z",
          "M-76,200 C-92,200 -106,208 -114,218 C-100,216 -84,210 -72,206 Z",
          "M60,248 C60,264 66,278 76,286 C78,272 74,256 70,246 Z",
        ].map((d, i) => (
          <path key={i} d={d} fill={M.spec} stroke={M.core} strokeWidth="1.6" />
        ))}
      </g>
    </svg>
  );
}
