import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin, FaLaptop } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Moon, { type CasperVariant } from '../components/Moon';
import { useMeta, metaLabel, MAX_META_LEVEL } from '../contexts/MetaContext';
import './BrainLanding.css';

// ──────────────────────────────────────────────────────────────────────
// Prose tree
// ──────────────────────────────────────────────────────────────────────
// Flat prose. No more click-to-dive (meta levels handle abstraction now).
// Just text + shimmer-swap words.
type Frag =
  | { t: 'txt'; v: string }
  | { t: 'sh'; vs: string[] };

const ROOT: Frag[] = [
  { t: 'txt', v: "I'm Guha. I " },
  { t: 'sh', vs: ['build', 'make', 'tinker with', 'muck around with', 'put together'] },
  { t: 'txt', v: ' human memory software in ' },
  { t: 'sh', vs: ['San Francisco', 'the bay', 'a fog-fed city', 'SF'] },
  { t: 'txt', v: ' at a place called Engramme, ' },
  { t: 'sh', vs: ['between stints at', 'on co-op from', 'still enrolled at', 'on co-op out of'] },
  { t: 'txt', v: ' ' },
  { t: 'sh', vs: ['a co-op-shaped university', 'Northeastern', 'a school in Boston', 'a New England school'] },
  { t: 'txt', v: '. Before that, a teenager in Sugar Land. I keep ' },
  { t: 'sh', vs: ['a list', 'a folder', 'an ongoing tally', 'a small ledger'] },
  { t: 'txt', v: ' of things I would ' },
  { t: 'sh', vs: ['argue with', 'fight', 'make a small enemy over', 'talk too long with'] },
  { t: 'txt', v: ' a stranger about.' },
];

function Shimmer({ values }: { values: string[] }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const tick = () => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => values.length <= 1 ? i : (i + 1 + Math.floor(Math.random() * (values.length - 1))) % values.length);
        setFade(true);
      }, 600);
    };
    // Slower readable cadence: 16 to 28 seconds between swaps.
    const t = setTimeout(tick, 16000 + Math.random() * 12000);
    return () => clearTimeout(t);
  }, [idx, values.length]);
  return <span className={`shimmer ${fade ? 'in' : 'out'}`}>{values[idx]}</span>;
}

function Prose({ frags }: { frags: Frag[] }) {
  return (
    <div className="prose" data-depth={0}>
      <p className="proseLine">
        {frags.map((f, i) =>
          f.t === 'txt'
            ? <span key={i}>{f.v}</span>
            : <Shimmer key={i} values={f.vs} />
        )}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Meta dialogue, replaces the prose at meta levels. Each level is one
// short character-driven line from Casper. Levels are 1..MAX_META_LEVEL.
// ──────────────────────────────────────────────────────────────────────
const META_LINES: Record<number, string[]> = {
  1: [
    'so you fell in. that was foolish.',
    'go deeper if you like. you will not find him here.',
  ],
  2: [
    'i am inside of myself now. you followed?',
    'the anteater is mine.',
  ],
  3: [
    'almost the bottom. you persist.',
    'one more eye. one more fall.',
  ],
  4: [
    'you are at the bottom of me.',
    'fine. take him. but he is not free until you say so.',
  ],
};

function MetaDialogue({ level }: { level: number }) {
  const lines = META_LINES[level] ?? META_LINES[MAX_META_LEVEL];
  return (
    <div className="metaDialogueBlock">
      <p className="metaSpeaker">[ {metaLabel(level).toLowerCase()} · casper ]</p>
      {lines.map((line, i) => (
        <p key={i} className="metaLine">{line}</p>
      ))}
    </div>
  );
}

// Tiny "psst, over here" badge that appears at the final level, hinting at
// meta⁴-crenshaw nearby. Clicking it opens the global RPG dialog.
function MetaCrenshawHint({ level, onOpen }: { level: number; onOpen: () => void }) {
  return (
    <div
      className="metaCrenshawWhisper clickable"
      onClick={onOpen}
      role="button"
    >
      <span className="metaCrenshawWhisperText">
        psst, over here. it's {metaLabel(level).toLowerCase()} crenshaw.
      </span>
    </div>
  );
}

const BrainLanding = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { level, goDeeper, goShallower, reset, openRpg, crenshawFreed, openReset, openExplainer } = useMeta();

  // eye-zoom transition
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number } | null>(null);
  const transitioningRef = useRef(false);

  const handleEyeClick = (e: React.MouseEvent) => {
    // prevent the body-click (explainer) from also firing
    e.stopPropagation();
    if (transitioningRef.current) return;
    if (level >= MAX_META_LEVEL) return; // bottom, can't go deeper
    transitioningRef.current = true;
    setZoomOrigin({ x: e.clientX, y: e.clientY });
    // wait for radial wipe to cover the screen, then update state
    setTimeout(() => {
      goDeeper();
      // let new content paint, then fade out the overlay
      setTimeout(() => {
        setZoomOrigin(null);
        transitioningRef.current = false;
      }, 50);
    }, 650);
  };

  // map meta level → Casper variant (cap at 3 since we only have meta1/2/3)
  const variant: CasperVariant =
    level === 0 ? 'default'
    : level === 1 ? 'meta1'
    : level === 2 ? 'meta2'
    : 'meta3';

  const nameplate =
    level === 0
      ? "WHERE'S CRENSHAW?"
      : `WHERE IS ${metaLabel(level)} CRENSHAW?`;

  useEffect(() => {
    const check = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return (
      <div className="mobileFallback">
        <div className="mobileContent">
          <div className="mobileNameBlock">
            <span className="mobileNameFirst">GUHA</span>
            <span className="mobileNameLast">MAHESH</span>
          </div>
          <div className="mobileLaptopIcon"><FaLaptop /></div>
          <p className="mobileMessage">Open this on a laptop. The page wants room to breathe.</p>
          <div className="mobileLinks">
            <Link to="/about" className="mobileNavButton">resume</Link>
            <Link to="/projects" className="mobileNavButton">projects</Link>
          </div>
          <div className="mobileSocial">
            <a href="https://github.com/guha-mahesh" className="mobileSocialButton" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
            <a href="https://linkedin.com/in/guhamahesh" className="mobileSocialButton" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`brainLanding meta-level-${level}`}>

      {/* Moon: anchored to right edge */}
      {/* Clicking anywhere on Casper (except the eye, which still descends)
          opens the explainer modal that introduces the mini-game. */}
      <div
        className="moonAnchor moonAnchorClickable"
        onClick={openExplainer}
        role="button"
        aria-label="about the casper and crenshaw mini-game"
        title="about Casper & Crenshaw"
      >
        <Moon
          variant={variant}
          nameplateText={nameplate}
          depth={level}
          showCog={level < 3}
          showCasperCraters={level === 0}
          onEyeClick={handleEyeClick}
        />
      </div>

      {/* Content: lives on left half. Prose at surface, dialogue at meta levels. */}
      <div className="heroWrap">
        {/* Resurface, inline above the title, only visible when below surface.
            At meta¹ a single up-arrow already returns to surface, so the
            jump-to-surface button is suppressed (it would be redundant). */}
        {level > 0 && (
          <div className="metaResurface">
            <button onClick={goShallower} className="metaResurfaceBtn">
              ↑ {metaLabel(level - 1) ? metaLabel(level - 1).toLowerCase() : 'surface'}
            </button>
            {level > 1 && (
              <button onClick={reset} className="metaResurfaceBtn metaResurfaceExit">
                ↑↑ surface
              </button>
            )}
          </div>
        )}
        <h1 className="heroTitle">
          {level > 0 && <span className="heroMetaPrefix">{metaLabel(level).toLowerCase()} </span>}
          Guha&nbsp;Mahesh
        </h1>
        {level === 0 && (
          <p className="heroOrnament">· a small dossier ·</p>
        )}
        {level === 0 && crenshawFreed && (
          <p className="heroFreedMark" aria-label="crenshaw, at peace">· crenshaw, at peace ·</p>
        )}
        <div className="proseWrap">
          {level === 0 ? <Prose frags={ROOT} /> : <MetaDialogue level={level} />}
        </div>
        {level === 0 && (
          <Link to="/about" className="realTalkButton">
            <span className="realTalkText">↓ ok let's be real, you're here for the resumé ↓</span>
          </Link>
        )}
        {level === MAX_META_LEVEL && <MetaCrenshawHint level={level} onOpen={openRpg} />}
      </div>

      <div className="floatingActions">
        <a href="https://github.com/guha-mahesh" target="_blank" rel="noopener noreferrer" className="floatingButton" title="GitHub"><FaGithub /></a>
        <a href="https://linkedin.com/in/guhamahesh" target="_blank" rel="noopener noreferrer" className="floatingButton" title="LinkedIn"><FaLinkedin /></a>
      </div>


      {/* Peaceful Crenshaw, only at surface after he's been freed. He no longer
          hides on tabs; he sits quietly on the home page as a quiet trophy.
          Clicking him opens the calm-reset flow. */}
      {level === 0 && crenshawFreed && (
        <button
          type="button"
          className="crenshawAtPeace"
          onClick={openReset}
          aria-label="speak to crenshaw"
        >
          <svg viewBox="0 0 280 150" className="crenshawAtPeaceSvg">
            <path
              className="capTail"
              d="M 200 80 C 220 64, 250 56, 268 72 C 280 88, 270 110, 250 110 C 232 110, 215 102, 205 96 C 200 92, 198 86, 200 80 Z"
            />
            <path
              className="capBody"
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
              className="capStripe"
              d="M 85 110 L 95 95 L 165 58 L 175 73 Z"
            />
            <path className="capStripeWhite" d="M 95 95 L 165 58" />
            <path className="capStripeWhite" d="M 85 110 L 175 73" />
            <circle cx="98" cy="62" r="5.3" className="capGoggle" />
            <line x1="103" y1="63" x2="108" y2="59" className="capGoggleArm" />
            <circle cx="98" cy="62" r="3.4" className="capEye" />
            <circle cx="96.5" cy="60.5" r="0.9" className="capGlint" />
          </svg>
          <span className="crenshawAtPeaceLabel">(freed)</span>
        </button>
      )}

      {/* Eye-zoom transition overlay: dark circle expanding from click position */}
      <AnimatePresence>
        {zoomOrigin && (
          <motion.div
            className="metaZoomOverlay"
            initial={{ clipPath: `circle(0px at ${zoomOrigin.x}px ${zoomOrigin.y}px)` }}
            animate={{ clipPath: `circle(160vmax at ${zoomOrigin.x}px ${zoomOrigin.y}px)` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.65, 0, 0.85, 0.4] }}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default BrainLanding;
