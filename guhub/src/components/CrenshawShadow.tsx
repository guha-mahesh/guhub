import { useEffect, useRef, useState } from 'react';
import { useMeta } from '../contexts/MetaContext';
import { useIsMobile } from '../hooks/useIsMobile';
import './CrenshawShadow.css';

// ──────────────────────────────────────────────────────────────────────
// Drawing-Hands shadow — once the meta-quest is done, the cursor sprouts
// a small anteater silhouette that follows it with a delay. Surface
// Crenshaw stops fleeing him: the chaser and the chased are the same.
// Pure Escher / Hofstadter — the cursor IS the anteater.
// ──────────────────────────────────────────────────────────────────────

const LERP = 0.12;
const SHADOW_SIZE = 48;

export default function CrenshawShadow() {
  const { metaQuestDone, crenshawFreed, optedOut } = useMeta();
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: -200, y: -200 });
  const posRef = useRef({ x: -200, y: -200 });
  const [active, setActive] = useState(false);

  // shadow is only present after meta-quest, and disappears once Crenshaw
  // has been released (the strange loop is closed). Also off on mobile —
  // no cursor to follow.
  const enabled = metaQuestDone && !crenshawFreed && !isMobile && !optedOut;

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!active) setActive(true);
    };
    window.addEventListener('mousemove', onMove);

    let raf = 0;
    const step = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * LERP;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * LERP;
      if (ref.current) {
        ref.current.style.transform =
          `translate3d(${posRef.current.x - SHADOW_SIZE / 2}px, ${posRef.current.y - SHADOW_SIZE / 2 + 20}px, 0)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled, active]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      className={`crenshawShadow ${active ? 'visible' : ''}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 280 150" className="crenshawShadowSvg">
        {/* simplified anteater silhouette */}
        <path
          className="csTail"
          d="M 200 80 C 220 64, 250 56, 268 72 C 280 88, 270 110, 250 110 C 232 110, 215 102, 205 96 C 200 92, 198 86, 200 80 Z"
        />
        <path
          className="csBody"
          d="M 8 78
             C 26 76, 50 74, 75 74
             C 82 73, 88 70, 92 64
             C 100 54, 115 48, 135 50
             C 158 52, 178 60, 192 70
             C 200 74, 206 80, 208 88
             C 208 96, 206 104, 200 110
             C 190 114, 178 114, 168 113
             C 154 113, 142 112, 130 113
             C 130 124, 130 132, 130 132
             L 140 132
             L 140 118
             C 140 112, 134 108, 124 108
             C 110 110, 92 112, 80 110
             C 80 122, 80 132, 80 132
             L 90 132
             L 90 118
             C 88 110, 82 104, 72 98
             C 64 94, 56 90, 50 87
             C 36 87, 22 86, 8 84
             Q 4 81, 8 78 Z"
        />
        <path
          className="csStripe"
          d="M 85 110 L 95 95 L 165 58 L 175 73 Z"
        />
      </svg>
    </div>
  );
}
