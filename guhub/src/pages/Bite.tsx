import { useMemo } from "react";

/**
 * The corner being taken off the plate.
 *
 * The first version stepped along the diagonal at a fixed interval with a
 * fixed depth, which reads as a zig-zag pattern: uniform unevenness is still
 * uniform. This one varies both the spacing and the depth, holds nearly
 * straight for a run or two, then takes a deep gouge, so no two stretches
 * of the edge look alike.
 */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tornEdge(seed: number, inset = 0) {
  const r = rng(seed);
  const pts: [number, number][] = [];
  let t = 0;
  while (t < 1) {
    // spacing: mostly short bites, occasionally a long clean run
    const step = r() < 0.18 ? 0.09 + r() * 0.13 : 0.018 + r() * 0.05;
    t = Math.min(1, t + step);
    // depth: usually shallow, sometimes a real gouge
    const deep = r() < 0.22;
    const depth = (deep ? 5 + r() * 12 : 0.4 + r() * 3.4) + inset;
    // walk the diagonal from (0,0) to (100,100), pushed up and right
    const x = t * 100 + depth * 0.7;
    const y = t * 100 - depth * 0.7;
    pts.push([Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y))]);
    // a sliver that juts back the other way now and then
    if (r() < 0.14) {
      const back = 1 + r() * 4;
      pts.push([Math.max(0, x - back * 0.8), Math.min(100, y + back * 0.8)]);
    }
  }
  return `M100,0 L100,100 ` + pts.reverse().map(([x, y]) => `L${x.toFixed(2)},${y.toFixed(2)}`).join(" ") + " Z";
}

export default function Bite() {
  const outer = useMemo(() => tornEdge(0x51d3, 0), []);
  const inner = useMemo(() => tornEdge(0x51d3, 1.6), []);
  return (
    <svg className="bite" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <path className="biteRule" d={inner} />
      <path className="biteBody" d={outer} />
    </svg>
  );
}
