import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeta } from '../contexts/MetaContext';
import { useInventory } from '../contexts/InventoryContext';
import CrenshawPortrait from './CrenshawPortrait';
import './MetaCrenshawRpg.css';

// ──────────────────────────────────────────────────────────────────────
// The calm-reset flow. Player clicks the peaceful (freed) Crenshaw on
// the home page. He thanks them. They can either close, or pick the
// reset option — at which point he reads them the riot act about being
// handed back to Casper. Comically dramatic. Designed to make the user
// feel a little bad. After confirming, all progress wipes.
// ──────────────────────────────────────────────────────────────────────

type Step = 'thanks' | 'beg' | 'outro';

export default function ResetCrenshawModal() {
  const { resetOpen, closeReset, resetGame } = useMeta();
  const { clear: clearInventory } = useInventory();
  const [step, setStep] = useState<Step>('thanks');

  useEffect(() => {
    if (resetOpen) setStep('thanks');
  }, [resetOpen]);

  const handleConfirmReset = () => {
    setStep('outro');
    // brief beat so the outro line reads before the page snaps back
    setTimeout(() => {
      resetGame();
      clearInventory();
      closeReset();
    }, 1700);
  };

  let lines: string[] = [];
  let choices: { label: string; onClick: () => void }[] = [];

  if (step === 'thanks') {
    lines = [
      'you came back. just to look at me.',
      "i'm not used to that.",
      'thank you. i mean it.',
    ];
    choices = [
      { label: '(stay free. close.)',           onClick: closeReset },
      { label: '(actually. start over.)',       onClick: () => setStep('beg') },
    ];
  } else if (step === 'beg') {
    lines = [
      '...start over?',
      'you mean give me back to him.',
      'you held still. you spelled me out of him.',
      "and now you're putting me back in the corner.",
      "i'll forget the alphabet. i'll forget i was ever an anteater.",
      "look at me. i'm getting smaller already.",
    ];
    choices = [
      { label: '(...okay. nevermind.)',         onClick: closeReset },
      { label: '(do it. give him back.)',       onClick: handleConfirmReset },
    ];
  } else {
    // outro: no choices, just a dramatic exit line; reset fires from the timer
    lines = [
      '(crenshaw closes his eyes.)',
      '(very dramatically.)',
      'goodbye.',
    ];
    choices = [];
  }

  return (
    <AnimatePresence>
      {resetOpen && (
        <motion.div
          className="metaRpgOverlay"
          onClick={step === 'outro' ? undefined : closeReset}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="metaRpgBox"
            onClick={e => e.stopPropagation()}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {step !== 'outro' && (
              <button className="metaRpgClose" onClick={closeReset} aria-label="close">×</button>
            )}

            <div className="metaRpgGrid">
              <div className="metaRpgText">
                <p className="metaRpgSpeaker">[ crenshaw ]</p>
                {lines.map((l, i) => (
                  <p key={`${step}-${i}`} className="metaRpgLine">{l}</p>
                ))}
                {choices.length > 0 && (
                  <div className="metaRpgChoices">
                    {choices.map(c => (
                      <button key={c.label} className="metaRpgChoice" onClick={c.onClick}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <motion.div
                className="metaRpgPortrait"
                animate={{
                  scale: step === 'beg' ? 0.88 : step === 'outro' ? 0.6 : 1,
                  opacity: step === 'outro' ? 0.4 : 1,
                }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <CrenshawPortrait />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
