import { useEffect } from "react";

/**
 * A real tartan, woven rather than drawn.
 *
 * Two things make plaid look like plaid instead of like crossed stripes.
 * First the sett: a thread count that is mirrored about a pivot, so the
 * pattern reads symmetrically in both directions. Second the weave: this is
 * 2/2 twill, so at every point either the warp thread or the weft thread is
 * on top, in diagonal runs of two. That diagonal is why real tartan has a
 * grain to it, and why crossings of two colours read as a checkerboard of
 * both rather than as one flat colour.
 *
 * The tile is generated once and handed to CSS as a repeating background, so
 * it costs one image and nothing per frame.
 */

/**
 * The void palette. Not the cloth dimmed uniformly: the ground is taken
 * almost to black so the corner reads as an absence, while the guards and
 * overchecks keep just enough light to say tartan. If everything is scaled
 * by the same factor you get a dark rectangle; the pattern only survives if
 * the light threads stay relatively lighter than the ground.
 */
const C = {
  R: [30, 6, 7],       // red ground, nearly gone
  K: [5, 4, 4],        // black
  W: [104, 98, 94],    // white guards, dimmed to ash
  B: [10, 17, 38],     // navy
  Y: [74, 55, 12],     // yellow
  G: [8, 26, 19],      // bottle green
  A: [16, 38, 72],     // azure
} as const;

type Key = keyof typeof C;

/** Half-sett, mirrored about the last entry. Royal Stewart in character. */
const HALF: [Key, number][] = [
  ["R", 24], ["K", 2], ["Y", 2], ["K", 2], ["R", 4], ["W", 2], ["R", 4],
  ["K", 6], ["G", 6], ["K", 1], ["W", 1], ["K", 1], ["G", 6], ["K", 6],
  ["R", 4], ["B", 3], ["W", 2], ["B", 3], ["R", 4], ["K", 2], ["W", 2],
  ["K", 2], ["A", 2], ["K", 2], ["R", 12],
];

function buildSett(): Key[] {
  const out: Key[] = [];
  for (const [k, n] of HALF) for (let i = 0; i < n; i++) out.push(k);
  // mirror back, excluding the pivot thread itself
  for (let i = out.length - 2; i >= 0; i--) out.push(out[i]);
  return out;
}

const THREAD = 3; // pixels per thread, so the weave is legible on screen

export function makeTartanTile(): string {
  const sett = buildSett();
  const n = sett.length;
  const size = n * THREAD;
  const cv = document.createElement("canvas");
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(size, size);
  const d = img.data;

  for (let y = 0; y < size; y++) {
    const j = (y / THREAD) | 0;
    const weft = C[sett[j]];
    const inThreadY = (y % THREAD) / THREAD;

    for (let x = 0; x < size; x++) {
      const i = (x / THREAD) | 0;
      const warp = C[sett[i]];
      const inThreadX = (x % THREAD) / THREAD;

      // 2/2 twill: runs of two along the diagonal decide which thread is up
      const warpUp = ((i + j) & 3) < 2;
      const c = warpUp ? warp : weft;

      // round the thread: darker at its edges, so the weave has body
      const across = warpUp ? inThreadX : inThreadY;
      let shade = 0.82 + 0.36 * Math.sin(Math.PI * (across + 0.02));
      // the twill catches the light along its diagonal
      if (((i + j) & 3) === 0) shade *= 1.06;
      if (((i + j) & 3) === 3) shade *= 0.93;
      // a little irregularity, so it reads as cloth and not as a print
      shade *= 0.985 + (((i * 73 + j * 31) % 17) / 17) * 0.03;

      const p = (y * size + x) << 2;
      d[p] = Math.min(255, c[0] * shade);
      d[p + 1] = Math.min(255, c[1] * shade);
      d[p + 2] = Math.min(255, c[2] * shade);
      d[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv.toDataURL("image/png");
}

/** Paints the tile once and hands it to CSS. Renders nothing itself. */
export default function Tartan() {
  useEffect(() => {
    const url = makeTartanTile();
    if (url) document.documentElement.style.setProperty("--tartan", `url("${url}")`);
  }, []);
  return null;
}
