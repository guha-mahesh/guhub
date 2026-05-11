import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeta } from '../contexts/MetaContext';
import CrenshawPortrait from './CrenshawPortrait';
import './MiuPuzzle.css';

// ──────────────────────────────────────────────────────────────────────
// MIU-style puzzle — Phase 2 of catching surface Crenshaw.
//
//   Start:  M
//   Goal:   MCRENSHAW
//
// 7 rules, each appends or transforms a letter. Each rule is GATED by
// the current string's suffix — wrong sequence is no-op (you see why).
// The player must read the string and figure out which rule fits next.
//
// In MIU-style spirit: a tiny formal system that names the thing into
// being. The act of derivation IS the act of release.
// ──────────────────────────────────────────────────────────────────────

interface Rule {
  id: string;
  body: string;          // formal form
  description: string;   // human gloss
  apply: (s: string) => string | null;
}

// Replace first occurrence of `from` with `to`. Null if not present.
const sub = (from: string, to: string) => (s: string) =>
  s.includes(from) ? s.replace(from, to) : null;

// Anchored rewrites — only apply if string starts/ends with `from`.
const subPrefix = (from: string, to: string) => (s: string) =>
  s.startsWith(from) && !s.startsWith(to) ? to + s.slice(from.length) : null;
const subSuffix = (from: string, to: string) => (s: string) =>
  s.endsWith(from) && !s.endsWith(to) ? s.slice(0, -from.length) + to : null;

const RULES: Rule[] = [
  {
    id: 'R1',
    body: 'CC ⊢ CR',
    description: 'a double C may be rewritten as CR',
    apply: sub('CC', 'CR'),
  },
  {
    id: 'R2',
    body: 'WW ⊢ AW',
    description: 'a double W may be rewritten as AW',
    apply: sub('WW', 'AW'),
  },
  {
    id: 'R3',
    body: '(start)CR ⊢ CREN',
    description: 'if the string opens with CR, it may extend to CREN',
    apply: subPrefix('CR', 'CREN'),
  },
  {
    id: 'R4',
    body: 'AW(end) ⊢ HAW',
    description: 'if the string closes with AW, it may extend to HAW',
    apply: subSuffix('AW', 'HAW'),
  },
  {
    id: 'R5',
    body: 'NH ⊢ NSH',
    description: 'an S may be interposed between N and H',
    apply: sub('NH', 'NSH'),
  },
  {
    id: 'R6',
    body: 'C ⊢ CC',
    description: 'a single C may be doubled',
    apply: sub('C', 'CC'),
  },
  {
    id: 'R7',
    body: 'W ⊢ WW',
    description: 'a single W may be doubled',
    apply: sub('W', 'WW'),
  },
  {
    id: 'R8',
    body: 'NSH ⊢ NH',
    description: 'a triple NSH may collapse back to NH (loses S)',
    apply: sub('NSH', 'NH'),
  },
  {
    id: 'R9',
    body: 'HAW(end) ⊢ AW',
    description: 'if the string closes with HAW, it may collapse to AW',
    apply: subSuffix('HAW', 'AW'),
  },
];

// Two valid axioms. Player picks one to start; both reach CRENSHAW.
//   CCWW — 5-step minimum (R1 → R2 → R3 → R4 → R5)
//   CW   — 7-step minimum (R6 → R7 → then the same 5)
const AXIOMS = ['CCWW', 'CW'];
const GOAL = 'CRENSHAW';
const START = AXIOMS[0]; // default — player can switch via UI

export default function MiuPuzzle() {
  const { miuOpen, closeMiu, freeCrenshaw } = useMeta();
  const [axiom, setAxiom] = useState(START);
  const [theorem, setTheorem] = useState(START);
  const [history, setHistory] = useState<string[]>([START]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  // reset when modal opens
  useEffect(() => {
    if (miuOpen) {
      setAxiom(START);
      setTheorem(START);
      setHistory([START]);
      setLastError(null);
      setSolved(false);
    }
  }, [miuOpen]);

  const pickAxiom = (a: string) => {
    if (solved) return;
    setAxiom(a);
    setTheorem(a);
    setHistory([a]);
    setLastError(null);
  };

  // detect win
  useEffect(() => {
    if (theorem === GOAL && !solved) {
      setSolved(true);
      setTimeout(() => freeCrenshaw(), 1800);
    }
  }, [theorem, solved, freeCrenshaw]);

  // Boss taunt scales with how recognizable the theorem is.
  const bossLine = (() => {
    if (solved) return 'okay. you spelled me. fine.';
    if (theorem === axiom) return "you can't derive me. no anteater has been derived.";
    if (theorem.includes('CRAW')) return "one step from spelling me. i hate this part.";
    if (theorem.includes('CR') && theorem.includes('AW')) return 'you have the bookends. now what.';
    if (theorem.includes('CR') || theorem.includes('AW')) return 'getting somewhere. not far enough.';
    if (theorem.length > 6) return 'you are sprawling, not deriving.';
    return 'you have drifted.';
  })();

  const apply = (r: Rule) => {
    if (solved) return;
    setLastError(null);
    const next = r.apply(theorem);
    if (next === null) {
      setLastError(`rule ${r.id} does not apply to "${theorem}"`);
      return;
    }
    setTheorem(next);
    setHistory(h => [...h, next]);
  };

  const undo = () => {
    if (history.length <= 1 || solved) return;
    setHistory(h => h.slice(0, -1));
    setTheorem(history[history.length - 2]);
    setLastError(null);
  };

  const reset = () => {
    if (solved) return;
    setTheorem(axiom);
    setHistory([axiom]);
    setLastError(null);
  };

  return (
    <AnimatePresence>
      {miuOpen && (
        <motion.div
          className="miuOverlay"
          onClick={solved ? undefined : closeMiu}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="miuBox"
            onClick={e => e.stopPropagation()}
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {!solved && (
              <button className="miuClose" onClick={closeMiu} aria-label="close">×</button>
            )}

            {/* === Crenshaw watching from above, boss-fight style === */}
            <div className="miuBoss">
              <div className="miuBossPortrait">
                <CrenshawPortrait />
              </div>
              <div className="miuBossDialog">
                <p className="miuBossSpeaker">[ crenshaw ]</p>
                <p className="miuBossLine">{bossLine}</p>
              </div>
            </div>

            <p className="miuLabel">[ formal system · phase ii ]</p>
            <h2 className="miuTitle">spell him out.</h2>
            <p className="miuInstruction">
              the anteater watches from above. pick an axiom. apply rules.
              derive his name: <code>{GOAL}</code>.
              rules rewrite the first occurrence of their pattern. some lengthen, some shorten.
            </p>

            <div className="miuAxiomRow">
              <span className="miuAxiomLabel">axioms</span>
              {AXIOMS.map(a => (
                <button
                  key={a}
                  className={`miuAxiomBtn ${axiom === a ? 'active' : ''}`}
                  disabled={solved}
                  onClick={() => pickAxiom(a)}
                >
                  {a}
                </button>
              ))}
            </div>

            <div className="miuTheoremBlock">
              <span className="miuTheoremLabel">current</span>
              <span className={`miuTheorem ${solved ? 'solved' : ''}`}>
                {theorem.split('').map((c, i) => {
                  // highlight characters that participate in the goal substring
                  const inGoal = GOAL.includes(c);
                  return (
                    <span key={i} className={`miuChar ${inGoal ? 'miuCharOk' : ''}`}>
                      {c}
                    </span>
                  );
                })}
              </span>
            </div>

            <div className="miuRules">
              {RULES.map(r => {
                const canApply = r.apply(theorem) !== null;
                return (
                  <button
                    key={r.id}
                    className={`miuRule ${canApply ? 'avail' : ''}`}
                    disabled={solved}
                    onClick={() => apply(r)}
                  >
                    <span className="miuRuleId">{r.id}</span>
                    <span className="miuRuleBody">{r.body}</span>
                    <span className="miuRuleDesc">{r.description}</span>
                  </button>
                );
              })}
            </div>

            <div className="miuFooter">
              <div className="miuActions">
                <button className="miuAction" onClick={undo} disabled={history.length <= 1 || solved}>
                  ← undo
                </button>
                <button className="miuAction" onClick={reset} disabled={solved}>
                  reset
                </button>
              </div>
              {lastError && <p className="miuError">{lastError}</p>}
              {solved && (
                <motion.p
                  className="miuSolved"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  spelled. the anteater is released.
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
