import { useEffect, useRef } from "react";

/**
 * The whole atmosphere in one layer.
 *
 * This used to be nine stacked full-viewport divs: five masked dither bands
 * for the sky, a floor dither, a diagonal ground hatch and a vignette. Nine
 * masked layers cost about 6.5ms a frame, which was most of the jank. All of
 * it is static, so it is drawn once into a single canvas instead: one
 * composited layer, no masks, nothing to repaint when the world moves.
 */

// ordered Bayer 8x8
const BAYER = (() => {
  const build = (n: number): number[][] => {
    if (n === 1) return [[0]];
    const s = build(n / 2);
    const out = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let y = 0; y < n / 2; y++) {
      for (let x = 0; x < n / 2; x++) {
        const v = s[y][x] * 4;
        out[y][x] = v;
        out[y][x + n / 2] = v + 2;
        out[y + n / 2][x] = v + 3;
        out[y + n / 2][x + n / 2] = v + 1;
      }
    }
    return out;
  };
  return build(8);
})();

/** density of each sky course, top of frame downward, and where it ends */
const BANDS: [number, number][] = [
  [20, 0.13], [15, 0.24], [11, 0.33], [8, 0.41], [5, 0.47], [3, 0.52], [1, 0.57],
];

const HORIZON = 0.57;
const INK = [12, 6, 6];

function paint(cv: HTMLCanvasElement) {
  const w = Math.ceil(window.innerWidth);
  const h = Math.ceil(window.innerHeight);
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d");
  if (!ctx) return;

  const img = ctx.createImageData(w, h);
  const d = img.data;
  const cx = w / 2, cy = h * 0.48;
  const rx = w * 0.41, ry = h * 0.37;

  for (let y = 0; y < h; y++) {
    const ty = y / h;
    // which sky course this row belongs to
    let level = 0;
    for (const [lv, end] of BANDS) { if (ty < end) { level = lv; break; } }
    const row = BAYER[y & 7];
    const below = ty > HORIZON;

    for (let x = 0; x < w; x++) {
      let a = 0;
      if (!below && level && row[x & 7] < level) a = 0.26;
      if (below) {
        // ground: a lighter dither, plus ruled diagonal hatch
        if (row[x & 7] < 8) a = 0.18;
        if ((x + y) % 6 === 0) a = Math.max(a, 0.14 * Math.min(1, (ty - HORIZON) / 0.18));
      }
      // vignette, elliptical, only biting near the edges
      const nx = (x - cx) / rx, ny = (y - cy) / ry;
      const r = Math.sqrt(nx * nx + ny * ny);
      if (r > 1) a = Math.min(0.62, a + Math.min(0.42, (r - 1) * 0.5));

      if (a > 0) {
        const i = (y * w + x) << 2;
        d[i] = INK[0]; d[i + 1] = INK[1]; d[i + 2] = INK[2];
        d[i + 3] = (a * 255) | 0;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

export default function Grain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    paint(cv);
    let t = 0;
    const onResize = () => { clearTimeout(t); t = window.setTimeout(() => paint(cv), 150); };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t); };
  }, []);
  return <canvas className="grain" ref={ref} aria-hidden />;
}
