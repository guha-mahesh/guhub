import { motion, AnimatePresence } from 'framer-motion';
import { useMeta } from '../contexts/MetaContext';
import './CrenshawExplainer.css';

// ──────────────────────────────────────────────────────────────────────
// Lightweight modal that explains what the Casper/Crenshaw mini-game is.
// Triggered by clicking Casper (the moon) or one of his speech bubbles.
// Includes an opt-out button so users who'd rather not deal with it can
// suppress the anteater + Casper toasts site-wide; the opt-out persists
// in localStorage and can be reversed via a small opt-in icon.
// ──────────────────────────────────────────────────────────────────────

export default function CrenshawExplainer() {
  const { explainerOpen, closeExplainer, optedOut, optOut, optBackIn } = useMeta();

  const handleOptOut = () => {
    optOut();
    closeExplainer();
  };
  const handleOptBackIn = () => {
    optBackIn();
    closeExplainer();
  };

  return (
    <AnimatePresence>
      {explainerOpen && (
        <motion.div
          className="explainerOverlay"
          onClick={closeExplainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="explainerBox"
            onClick={e => e.stopPropagation()}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="explainerClose" onClick={closeExplainer} aria-label="close">×</button>
            <p className="explainerLabel">[ casper &amp; crenshaw ]</p>
            <h2 className="explainerTitle">a tiny strange-loop mini-game</h2>
            <p className="explainerBody">
              The moon is Casper. The anteater hiding around the site is Crenshaw.
              Clicking Casper&apos;s eye drops you a level into him; do that four
              times and the loop closes. Loosely inspired by Gödel, Escher, Bach.
            </p>
            <p className="explainerBody explainerHint">
              No obligation to play. If the anteater and the Casper banter are
              distracting, you can shut both off.
            </p>

            <div className="explainerActions">
              {optedOut ? (
                <button className="explainerBtn explainerBtnPrimary" onClick={handleOptBackIn}>
                  turn it back on
                </button>
              ) : (
                <button className="explainerBtn explainerBtnQuiet" onClick={handleOptOut}>
                  no thanks, hide the mini-game
                </button>
              )}
              <button className="explainerBtn" onClick={closeExplainer}>close</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
