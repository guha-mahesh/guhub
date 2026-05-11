import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeta } from '../contexts/MetaContext';
import { useInventory, type ItemId } from '../contexts/InventoryContext';
import './MetaNpcs.css';

// ──────────────────────────────────────────────────────────────────────
// Each NPC is pinned to a specific route at its meta level, so the
// player has to navigate the site to find them, not just stare at home.
// ──────────────────────────────────────────────────────────────────────
const NPC_ROUTES = {
  berries: '/listening',  // meta¹: hidden on the listening tab
  bear:    '/about',      // meta²: hidden on the resume tab
  ant:     '/projects',   // meta³: hidden on the projects tab
} as const;

// ──────────────────────────────────────────────────────────────────────
// Quest NPCs that live at specific meta levels:
//   meta¹: a steampunk berry bush, pick to add `berries` to inventory
//   meta²: a steampunk bear     , trades `berries` for `honey`
//   meta³: a tiny steampunk ant , trades `honey` for `ant` (himself)
//
// Each is a small SVG positioned at a different spot per level so they
// have to be found (where's-waldo style, but the trail is the inventory).
// ──────────────────────────────────────────────────────────────────────

interface NpcDialog {
  speaker: string;
  greet: string[];                     // shown on first click
  needText: string;                    // "i'd love some X..."
  satisfiedText: string;               // "ah, perfect" after handing item over
}

const DIALOGS: Record<'berries' | 'bear' | 'ant', NpcDialog> = {
  berries: {
    speaker: 'the bush',
    greet: ['no one comes down this far.', 'these are yours if you want them.'],
    needText: '(berries glisten. they want nothing in return.)',
    satisfiedText: '',
  },
  bear: {
    speaker: 'the bear',
    greet: ['hello, small thing.', 'i have something sweet. you have something red.'],
    needText: 'leave the berries on the stump. take the honey jar.',
    satisfiedText: 'good. tell the ant his uncle says hello.',
  },
  ant: {
    speaker: 'the ant',
    greet: ['careful. i am very small.', 'i have been waiting for someone with honey.'],
    needText: 'set the jar down. i will climb into your pocket.',
    satisfiedText: 'i am yours. take me down. casper is hungry.',
  },
};

// ───────────────── Berries (meta¹, /listening) ─────────────────
function Berries() {
  const { add, has } = useInventory();
  const location = useLocation();
  if (has('berries')) return null;
  if (location.pathname !== NPC_ROUTES.berries) return null;
  const onPick = () => add('berries');
  return (
    <NpcTrigger
      kind="berries"
      position={{ bottom: '8vh', right: '6vw' }}
      onAction={onPick}
      hint="pick the berries"
    >
      <BerriesSvg />
    </NpcTrigger>
  );
}

// ───────────────── Bear (meta², /about) ─────────────────
function Bear() {
  const { add, remove, has } = useInventory();
  const location = useLocation();
  if (has('honey')) return null;
  if (location.pathname !== NPC_ROUTES.bear) return null;
  const canTrade = has('berries');
  const onAction = () => {
    if (!canTrade) return;
    remove('berries');
    add('honey');
  };
  return (
    <NpcTrigger
      kind="bear"
      position={{ top: '20vh', right: '4vw' }}
      onAction={onAction}
      canAction={canTrade}
      gatedHint="(needs berries)"
    >
      <BearSvg />
    </NpcTrigger>
  );
}

// ───────────────── Ant (meta³, /projects) ─────────────────
function Ant() {
  const { add, remove, has } = useInventory();
  const location = useLocation();
  if (has('ant')) return null;
  if (location.pathname !== NPC_ROUTES.ant) return null;
  const canTrade = has('honey');
  const onAction = () => {
    if (!canTrade) return;
    remove('honey');
    add('ant');
  };
  return (
    <NpcTrigger
      kind="ant"
      position={{ bottom: '12vh', left: '8vw' }}
      onAction={onAction}
      canAction={canTrade}
      gatedHint="(needs honey)"
    >
      <AntSvg />
    </NpcTrigger>
  );
}

// ───────────────── Generic trigger + dialog ─────────────────
type NpcKind = keyof typeof DIALOGS;

interface NpcTriggerProps {
  kind: NpcKind;
  position: React.CSSProperties;
  onAction: () => void;
  canAction?: boolean;
  gatedHint?: string;
  hint?: string;
  children: React.ReactNode;
}

function NpcTrigger({ kind, position, onAction, canAction = true, gatedHint, hint, children }: NpcTriggerProps) {
  const [open, setOpen] = useState(false);
  const [acted, setActed] = useState(false);
  const d = DIALOGS[kind];

  const close = () => { setOpen(false); setActed(false); };
  const handleAction = () => {
    if (!canAction) return;
    onAction();
    setActed(true);
    setTimeout(close, 1100);
  };

  return (
    <>
      <motion.button
        className={`npcTrigger npc-${kind}`}
        style={position}
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        aria-label={`speak to ${d.speaker}`}
      >
        {children}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="npcDialogOverlay"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="npcDialogBox"
              onClick={e => e.stopPropagation()}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <button className="npcDialogClose" onClick={close}>×</button>
              <p className="npcDialogSpeaker">[ {d.speaker} ]</p>
              {acted
                ? <p className="npcDialogLine">{d.satisfiedText || '(taken.)'}</p>
                : <>
                    {d.greet.map((g, i) => <p key={i} className="npcDialogLine">{g}</p>)}
                    <p className="npcDialogLine npcDialogNeed">
                      {canAction ? d.needText : gatedHint}
                    </p>
                  </>
              }
              <div className="npcDialogChoices">
                {!acted && canAction && (
                  <button className="npcDialogChoice" onClick={handleAction}>
                    {hint ?? '(make the trade)'}
                  </button>
                )}
                {!acted && !canAction && (
                  <button className="npcDialogChoice" onClick={close}>(go back up)</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ───────────────── Tiny SVGs ─────────────────

function BerriesSvg() {
  return (
    <svg viewBox="0 0 80 80" className="npcSvg npcSvgBerries">
      {/* leaves */}
      <path d="M 18 38 Q 14 22 26 18 Q 36 22 30 34 Z" className="leaf" />
      <path d="M 58 38 Q 64 22 50 18 Q 40 22 50 34 Z" className="leaf" />
      <path d="M 38 28 Q 36 14 42 12 Q 50 18 44 30 Z" className="leaf" />
      {/* berries cluster */}
      <circle cx="28" cy="44" r="7" className="berry" />
      <circle cx="42" cy="48" r="8" className="berry" />
      <circle cx="55" cy="44" r="7" className="berry" />
      <circle cx="34" cy="58" r="7" className="berry" />
      <circle cx="48" cy="62" r="7" className="berry" />
      {/* highlights */}
      <circle cx="26" cy="42" r="1.4" className="berryGlint" />
      <circle cx="40" cy="46" r="1.6" className="berryGlint" />
      <circle cx="53" cy="42" r="1.4" className="berryGlint" />
      {/* brass twig */}
      <line x1="42" y1="68" x2="42" y2="76" className="twig" />
    </svg>
  );
}

function BearSvg() {
  return (
    <svg viewBox="0 0 100 110" className="npcSvg npcSvgBear">
      {/* hulking body, hunched */}
      <path
        className="bearBody"
        d="M 18 72
           C 14 56, 22 50, 32 50
           C 38 36, 60 36, 66 50
           C 78 50, 86 60, 84 80
           C 86 96, 70 102, 50 102
           C 30 102, 14 96, 18 72 Z"
      />

      {/* angular head, low forehead */}
      <path
        className="bearBody"
        d="M 24 30
           C 22 16, 32 8, 40 12
           C 48 6, 60 8, 64 18
           C 76 18, 78 32, 72 40
           C 72 50, 28 50, 28 40
           C 22 38, 22 32, 24 30 Z"
      />

      {/* ragged ears */}
      <path className="bearBody" d="M 26 18 L 22 4 L 36 12 Z" />
      <path className="bearBody" d="M 70 18 L 78 4 L 64 14 Z" />

      {/* heavy brow ridge, angled inward */}
      <path className="bearBrow" d="M 32 28 L 44 30 L 46 34 L 30 33 Z" />
      <path className="bearBrow" d="M 68 28 L 56 30 L 54 34 L 70 33 Z" />

      {/* sunken left eye, empty socket */}
      <circle cx="38" cy="37" r="4.5" className="bearEyeSocket" />
      <circle cx="38" cy="37" r="2.2" className="bearEye" />
      <circle cx="37.5" cy="36.5" r="0.6" className="bearEyeGlint" />

      {/* right eye stitched shut (scar) */}
      <path className="bearScar" d="M 53 36 L 67 38" />
      <path className="bearStitch" d="M 55 35 L 55 38" />
      <path className="bearStitch" d="M 58 35.5 L 58 37.5" />
      <path className="bearStitch" d="M 61 36 L 61 38" />
      <path className="bearStitch" d="M 64 36.5 L 64 38.5" />

      {/* snout, angular */}
      <path
        className="bearMuzzle"
        d="M 38 44
           L 62 44
           L 64 56
           L 50 60
           L 36 56 Z"
      />
      {/* nose */}
      <path className="bearNose" d="M 46 49 L 54 49 L 52 53 L 48 53 Z" />

      {/* mouth, open, jagged teeth */}
      <path className="bearMouthFill" d="M 38 56 L 62 56 L 56 66 L 44 66 Z" />
      <path className="bearTooth" d="M 41 56 L 43 62 L 45 56 Z" />
      <path className="bearTooth" d="M 47 56 L 49 64 L 51 56 Z" />
      <path className="bearTooth" d="M 53 56 L 55 62 L 57 56 Z" />

      {/* body cracks/cross-hatch */}
      <g className="bearHatch">
        <line x1="32" y1="68" x2="40" y2="84" />
        <line x1="44" y1="74" x2="50" y2="88" />
        <line x1="62" y1="68" x2="56" y2="86" />
        <line x1="72" y1="74" x2="68" y2="90" />
      </g>

      {/* brass collar with rivets */}
      <path className="bearCollar" d="M 24 64 Q 50 76 76 64" />
      <circle cx="32" cy="68" r="1.6" className="bearRivet" />
      <circle cx="50" cy="73" r="1.6" className="bearRivet" />
      <circle cx="68" cy="68" r="1.6" className="bearRivet" />

      {/* a single hanging brass key/tag on the chest */}
      <line x1="50" y1="76" x2="50" y2="84" className="bearChain" />
      <circle cx="50" cy="86" r="3" className="bearKey" />
      <circle cx="50" cy="86" r="1" className="bearKeyHole" />

      {/* a single drip below the stitched eye, black tear */}
      <path className="bearDrip" d="M 60 39 L 60 47 Q 60 50 62 50" />
    </svg>
  );
}

function AntSvg() {
  return (
    <svg viewBox="0 0 100 50" className="npcSvg npcSvgAnt">
      {/* body segments */}
      <ellipse cx="22" cy="25" rx="10" ry="8" className="antBody" />
      <ellipse cx="44" cy="25" rx="9" ry="7" className="antBody" />
      <ellipse cx="66" cy="25" rx="13" ry="9" className="antBody" />
      {/* head antennae */}
      <line x1="14" y1="20" x2="6" y2="10" className="antAntenna" />
      <line x1="16" y1="18" x2="12" y2="8" className="antAntenna" />
      <circle cx="6" cy="10" r="1.4" className="antAntennaTip" />
      <circle cx="12" cy="8" r="1.4" className="antAntennaTip" />
      {/* eye */}
      <circle cx="18" cy="22" r="1.6" className="antEye" />
      {/* six legs */}
      <line x1="38" y1="30" x2="32" y2="42" className="antLeg" />
      <line x1="44" y1="32" x2="44" y2="46" className="antLeg" />
      <line x1="50" y1="30" x2="56" y2="42" className="antLeg" />
      <line x1="58" y1="30" x2="52" y2="44" className="antLeg" />
      <line x1="66" y1="32" x2="66" y2="46" className="antLeg" />
      <line x1="74" y1="30" x2="80" y2="44" className="antLeg" />
      {/* small brass plate on abdomen */}
      <rect x="61" y="22" width="10" height="3" className="antPlate" />
      <circle cx="63" cy="23.5" r="0.8" className="antRivet" />
      <circle cx="69" cy="23.5" r="0.8" className="antRivet" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Renders the right NPC for the current meta level.
// ──────────────────────────────────────────────────────────────────────
export default function MetaNpcs() {
  const { level } = useMeta();
  if (level === 1) return <Berries />;
  if (level === 2) return <Bear />;
  if (level === 3) return <Ant />;
  return null;
}

// ──────────────────────────────────────────────────────────────────────
// Tiny inventory indicator shown at meta levels, helps player track
// what they're carrying so they know if the next trade is gated.
// ──────────────────────────────────────────────────────────────────────
const ITEM_LABELS: Record<ItemId, string> = {
  berries: '🫐 berries',
  honey:   '🍯 honey',
  ant:     '🐜 ant',
};

export function InventoryBar() {
  const { items } = useInventory();
  const { level } = useMeta();
  if (level === 0 || items.length === 0) return null;
  return (
    <div className="inventoryBar">
      <span className="inventoryBarLabel">carrying:</span>
      {items.map(id => (
        <span key={id} className="inventoryItem">{ITEM_LABELS[id]}</span>
      ))}
    </div>
  );
}
