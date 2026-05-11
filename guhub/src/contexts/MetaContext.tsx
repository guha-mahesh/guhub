import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

// ──────────────────────────────────────────────────────────────────────
// MetaContext, global meta-depth state. Affects how the surface page
// renders, what Casper looks like, what Crenshaw is doing.
// Persisted to localStorage so progress survives tab close (rewards
// for solving the meta-quest / freeing Crenshaw stay earned).
// ──────────────────────────────────────────────────────────────────────

export const MAX_META_LEVEL = 4;
const STORAGE_KEY = 'meta:level';

interface MetaCtx {
  level: number;
  goDeeper: () => void;
  goShallower: () => void;
  reset: () => void;
  /** True once the player has descended past surface for the first time
   *  (used to suppress the Casper-dialogue hint after they "get it"). */
  metaVisited: boolean;
  rpgOpen: boolean;
  openRpg: () => void;
  closeRpg: () => void;
  /** True once meta⁴-Crenshaw has been fed the ant — unlocks Phase 1
   *  cursor-shadow + Phase 2 MIU on the surface. Persistent. */
  metaQuestDone: boolean;
  markMetaQuestDone: () => void;
  /** True once surface Crenshaw has been "released" via the MIU
   *  derivation. After this he stops being chased forever. Persistent. */
  crenshawFreed: boolean;
  freeCrenshaw: () => void;
  /** MIU puzzle modal */
  miuOpen: boolean;
  openMiu: () => void;
  closeMiu: () => void;
  /** Reset modal (the peaceful-Crenshaw "give him back to casper" flow) */
  resetOpen: boolean;
  openReset: () => void;
  closeReset: () => void;
  /** Wipe all game progress back to factory state. */
  resetGame: () => void;
}

const QUEST_DONE_KEY = 'crenshaw:meta-quest-done';
const FREED_KEY = 'crenshaw:freed';
const META_VISITED_KEY = 'meta:visited';

const MetaContext = createContext<MetaCtx>({
  level: 0,
  goDeeper: () => {},
  goShallower: () => {},
  reset: () => {},
  metaVisited: false,
  rpgOpen: false,
  openRpg: () => {},
  closeRpg: () => {},
  metaQuestDone: false,
  markMetaQuestDone: () => {},
  crenshawFreed: false,
  freeCrenshaw: () => {},
  miuOpen: false,
  openMiu: () => {},
  closeMiu: () => {},
  resetOpen: false,
  openReset: () => {},
  closeReset: () => {},
  resetGame: () => {},
});

export function MetaProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    // migrate prior sessionStorage value if present (one-time)
    const legacy = window.sessionStorage.getItem(STORAGE_KEY);
    if (legacy !== null) {
      window.localStorage.setItem(STORAGE_KEY, legacy);
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? parseInt(saved, 10) : 0;
    return Number.isFinite(parsed) ? Math.max(0, Math.min(MAX_META_LEVEL, parsed)) : 0;
  });
  const [rpgOpen, setRpgOpen] = useState(false);
  const [miuOpen, setMiuOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  // Persistent achievements (localStorage, not session)
  const [metaQuestDone, setMetaQuestDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(QUEST_DONE_KEY) === '1';
  });
  const [crenshawFreed, setCrenshawFreed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(FREED_KEY) === '1';
  });
  const [metaVisited, setMetaVisited] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(META_VISITED_KEY) === '1';
  });

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, String(level)); } catch {}
  }, [level]);
  useEffect(() => {
    try { window.localStorage.setItem(QUEST_DONE_KEY, metaQuestDone ? '1' : '0'); } catch {}
  }, [metaQuestDone]);
  useEffect(() => {
    try { window.localStorage.setItem(FREED_KEY, crenshawFreed ? '1' : '0'); } catch {}
  }, [crenshawFreed]);
  useEffect(() => {
    try { window.localStorage.setItem(META_VISITED_KEY, metaVisited ? '1' : '0'); } catch {}
  }, [metaVisited]);

  const goDeeper = useCallback(() => setLevel(l => {
    const next = Math.min(MAX_META_LEVEL, l + 1);
    if (next > 0) setMetaVisited(true);
    return next;
  }), []);
  const goShallower = useCallback(() => setLevel(l => Math.max(0, l - 1)), []);
  const reset = useCallback(() => { setLevel(0); setRpgOpen(false); }, []);
  const openRpg = useCallback(() => setRpgOpen(true), []);
  const closeRpg = useCallback(() => setRpgOpen(false), []);
  const openMiu = useCallback(() => setMiuOpen(true), []);
  const closeMiu = useCallback(() => setMiuOpen(false), []);
  const markMetaQuestDone = useCallback(() => setMetaQuestDone(true), []);
  const freeCrenshaw = useCallback(() => { setCrenshawFreed(true); setMiuOpen(false); }, []);
  const openReset = useCallback(() => setResetOpen(true), []);
  const closeReset = useCallback(() => setResetOpen(false), []);
  // Full factory reset: every persisted flag goes back to defaults so the
  // game can be played from scratch. Casper's hint banter resumes, the
  // peaceful-Crenshaw vanishes, inventory clears (handled by caller via
  // InventoryContext.clear), and everything is freshly hideable again.
  const resetGame = useCallback(() => {
    setLevel(0);
    setMetaQuestDone(false);
    setCrenshawFreed(false);
    setMetaVisited(false);
    setRpgOpen(false);
    setMiuOpen(false);
  }, []);

  return (
    <MetaContext.Provider
      value={{
        level, goDeeper, goShallower, reset, metaVisited,
        rpgOpen, openRpg, closeRpg,
        metaQuestDone, markMetaQuestDone,
        crenshawFreed, freeCrenshaw,
        miuOpen, openMiu, closeMiu,
        resetOpen, openReset, closeReset, resetGame,
      }}
    >
      {children}
    </MetaContext.Provider>
  );
}

export const useMeta = () => useContext(MetaContext);

// Render "meta^N" with a Unicode superscript digit.
// Level 1 is just "META" (no exponent — meta¹ reads as redundant).
export function metaLabel(level: number): string {
  if (level <= 0) return '';
  if (level === 1) return 'META';
  const supers: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  };
  return 'META' + String(level).split('').map(d => supers[d]).join('');
}
