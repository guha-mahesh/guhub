import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeta, metaLabel, MAX_META_LEVEL } from '../contexts/MetaContext';
import { useInventory } from '../contexts/InventoryContext';
import CrenshawPortrait from './CrenshawPortrait';
import './MetaCrenshawRpg.css';

// ──────────────────────────────────────────────────────────────────────
// meta⁴-Crenshaw RPG dialog. Branches based on whether the player has
// the ant in inventory. Hand him over → he's freed, gives advice on
// catching the surface Crenshaw.
// ──────────────────────────────────────────────────────────────────────

type Step = 'open' | 'ask' | 'gift' | 'freed';

export default function MetaCrenshawRpg() {
  const { level, rpgOpen, closeRpg, markMetaQuestDone } = useMeta();
  const { has, remove } = useInventory();
  const [step, setStep] = useState<Step>('open');

  useEffect(() => {
    if (rpgOpen) setStep('open');
  }, [rpgOpen]);

  if (level < MAX_META_LEVEL) return null;

  const hasAnt = has('ant');
  const speaker = `${metaLabel(level).toLowerCase()} crenshaw`;

  let lines: string[] = [];
  let choices: { label: string; to: Step | 'close' }[] = [];

  if (step === 'open') {
    if (hasAnt) {
      // player has the ant, different opening line
      lines = [
        "you came back. and you brought him.",
        "set the ant down. carefully.",
      ];
      choices = [
        { label: '(hand over the ant)', to: 'gift' },
        { label: '(not yet)',           to: 'close' },
      ];
    } else {
      lines = [
        "hmm... I'd love to let you catch me. I'm a nuisance, even for an anteater.",
        "but I don't see a reason to let you.",
      ];
      choices = [
        { label: 'is there anything you might like?', to: 'ask' },
        { label: '(leave him be)',                    to: 'close' },
      ];
    }
  } else if (step === 'ask') {
    lines = [
      `well... ${metaLabel(level).toLowerCase()} ants aren't quite as delicious as ${metaLabel(level - 1).toLowerCase()} ants.`,
      `bring me one.`,
    ];
    choices = [
      { label: '(swallow. ascend one level.)', to: 'close' },
      { label: '(go back)',                    to: 'open' },
    ];
  } else if (step === 'gift') {
    // consume the ant once, mark the meta-quest as complete (unlocks the
    // Drawing-Hands + MIU surface mechanic), then move to freed
    if (hasAnt) { remove('ant'); markMetaQuestDone(); }
    lines = [
      "(he eats. quietly. eyes close.)",
      "thank you. I am yours now. and not casper's.",
    ];
    choices = [
      { label: 'what about the one above?', to: 'freed' },
      { label: '(close)',                   to: 'close' },
    ];
  } else if (step === 'freed') {
    lines = [
      `the chaser and the chased are the same hand drawing the other.`,
      `the anteater above is faster than me. go find him.`,
      `hold still when you do. then spell him out.`,
    ];
    choices = [
      { label: '(close. resurface.)', to: 'close' },
    ];
  }

  const onChoice = (to: Step | 'close') => {
    if (to === 'close') closeRpg();
    else setStep(to);
  };

  return (
    <AnimatePresence>
      {rpgOpen && (
        <motion.div
          className="metaRpgOverlay"
          onClick={closeRpg}
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
            <button className="metaRpgClose" onClick={closeRpg} aria-label="close">×</button>

            <div className="metaRpgGrid">
              <div className="metaRpgText">
                <p className="metaRpgSpeaker">[ {speaker} ]</p>
                {lines.map((l, i) => (
                  <p key={i} className="metaRpgLine">{l}</p>
                ))}
                <div className="metaRpgChoices">
                  {choices.map(c => (
                    <button key={c.label} className="metaRpgChoice" onClick={() => onChoice(c.to)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="metaRpgPortrait">
                <CrenshawPortrait />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
