import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeta } from '../contexts/MetaContext';
import './CasperSpeaks.css';

// ──────────────────────────────────────────────────────────────────────
// CasperSpeaks — Casper occasionally pipes up with an eye/moon pun.
//   On the home page (where his face is visible), renders as a speech
//   bubble pointing toward his mouth.
//   On every other page, renders as a small floating banner ("casper says").
// ──────────────────────────────────────────────────────────────────────

const LINES = [
  "i see what you did there.",
  "i've got my eye on you.",
  "iris-istible, isn't it?",
  "an eye for detail.",
  "ocular alert.",
  "let's keep an eye on this.",
  "spectator sport.",
  "look me in the eye.",
  "i can see right through that.",
  "all eyes on you.",
  "it's only a phase.",
  "moonlighting.",
  "lunar-ish.",
  "i'd say it's a sight for sore eyes.",
  "don't make me roll my eye.",
  "you have a good face for radio.",
  "blink twice if you see this.",
];

const VISIBLE_MS = 5500;
const NEXT_MIN_MS = 18000;
const NEXT_MAX_MS = 36000;

export default function CasperSpeaks() {
  const location = useLocation();
  const { level, metaVisited } = useMeta();
  const [line, setLine] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Casper himself doesn't render on mobile (the home page swaps to a
  // mobile fallback), so his speech bubble/banner shouldn't either.
  useEffect(() => {
    const check = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const onHome = location.pathname === '/';
  // Suppress when in a meta level (Casper speaks differently there) OR
  // once the player has ever descended at least once — the puns are
  // really a discoverability hint for the eye, and they've found it.
  // Also suppress on mobile (Casper isn't rendered there).
  const muted = level > 0 || metaVisited || isMobile;

  useEffect(() => {
    if (muted) { setLine(null); return; }
    let cancelled = false;
    let visibleTimer: ReturnType<typeof setTimeout> | null = null;
    let nextTimer:    ReturnType<typeof setTimeout> | null = null;

    const speak = () => {
      if (cancelled) return;
      const pick = LINES[Math.floor(Math.random() * LINES.length)];
      setLine(pick);
      visibleTimer = setTimeout(() => setLine(null), VISIBLE_MS);
      nextTimer = setTimeout(
        speak,
        VISIBLE_MS + NEXT_MIN_MS + Math.random() * (NEXT_MAX_MS - NEXT_MIN_MS),
      );
    };

    // first line shows shortly after mount/route change
    const startTimer = setTimeout(speak, 4500);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      if (visibleTimer) clearTimeout(visibleTimer);
      if (nextTimer)    clearTimeout(nextTimer);
    };
  }, [location.pathname, muted]);

  return (
    <AnimatePresence>
      {line && (
        <motion.div
          key={line}
          className={onHome ? 'casperBubble' : 'casperBanner'}
          initial={{ opacity: 0, y: onHome ? 6 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: onHome ? 6 : -8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {onHome ? (
            <>
              <p className="casperBubbleText">{line}</p>
              <span className="casperBubbleTail" />
            </>
          ) : (
            <>
              <span className="casperBannerLabel">casper says</span>
              <span className="casperBannerLine">{line}</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
