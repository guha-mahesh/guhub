import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GiantEye.css';

// ──────────────────────────────────────────────────────────────────────
// GiantEye — every 3-7 minutes, a massive eye fades into the aquarium
// background, blinks a couple of times, and fades out. Sits at low
// opacity behind the drifters so it reads as "something enormous out
// there in the water." Never interactable.
// ──────────────────────────────────────────────────────────────────────

const MIN_DELAY = 3 * 60 * 1000;
const MAX_DELAY = 7 * 60 * 1000;
const FIRST_DELAY_MIN = 45 * 1000;   // first appearance within ~45-90s
const FIRST_DELAY_MAX = 90 * 1000;
const VISIBLE_MS = 10000;

interface EyeInstance {
  id: number;
  x: number;          // % of viewport width (center of eye)
  y: number;          // % of viewport height
  scale: number;      // 0.8 - 1.3 multiplier
}

export default function GiantEye() {
  const [instance, setInstance] = useState<EyeInstance | null>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const schedule = (firstRun: boolean) => {
      const delay = firstRun
        ? FIRST_DELAY_MIN + Math.random() * (FIRST_DELAY_MAX - FIRST_DELAY_MIN)
        : MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
      showTimer = setTimeout(() => {
        counterRef.current += 1;
        setInstance({
          id: counterRef.current,
          x: 18 + Math.random() * 64,    // 18-82%
          y: 14 + Math.random() * 48,    // 14-62%
          scale: 0.85 + Math.random() * 0.5,
        });
        hideTimer = setTimeout(() => {
          setInstance(null);
          schedule(false);
        }, VISIBLE_MS);
      }, delay);
    };

    schedule(true);

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {instance && (
        <motion.div
          key={instance.id}
          className="giantEye"
          style={{
            left: `${instance.x}%`,
            top: `${instance.y}%`,
            transform: `translate(-50%, -50%) scale(${instance.scale})`,
          }}
          initial={{ opacity: 0 }}
          // keyframes: fade in, blink, hold, blink, fade out
          animate={{ opacity: [0, 0.26, 0.26, 0, 0.26, 0.26, 0, 0.26, 0] }}
          exit={{ opacity: 0 }}
          transition={{
            duration: VISIBLE_MS / 1000,
            times: [0, 0.28, 0.45, 0.49, 0.53, 0.74, 0.78, 0.82, 1],
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        >
          <svg viewBox="-400 -200 800 400" className="giantEyeSvg">
            {/* almond outline */}
            <path
              className="giantEyeShape"
              d="M -380 0
                 Q 0 -180, 380 0
                 Q 0 180, -380 0 Z"
            />
            {/* iris */}
            <circle cx="0" cy="0" r="130" className="giantEyeIris" />
            {/* iris striations */}
            {Array.from({ length: 18 }).map((_, i) => {
              const a = (i * 360) / 18;
              return (
                <line
                  key={i}
                  x1="0" y1="0" x2="0" y2="-130"
                  className="giantEyeStriation"
                  transform={`rotate(${a})`}
                />
              );
            })}
            {/* pupil */}
            <circle cx="0" cy="0" r="50" className="giantEyePupil" />
            {/* glint */}
            <circle cx="-22" cy="-22" r="14" className="giantEyeGlint" />
            <circle cx="38" cy="40" r="6" className="giantEyeGlint" />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
