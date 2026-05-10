import { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaLaptop } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Aquarium from '../components/Aquarium';
import Moon from '../components/Moon';
import './BrainLanding.css';

// ──────────────────────────────────────────────────────────────────────
// Prose tree
// ──────────────────────────────────────────────────────────────────────
type Frag =
  | { t: 'txt'; v: string }
  | { t: 'sh'; vs: string[] }
  | { t: 'dv'; label: string; into: Frag[] };

const ROOT: Frag[] = [
  { t: 'txt', v: "I'm Guha. I " },
  { t: 'sh', vs: ['build', 'make', 'tinker with', 'muck around with', 'put together'] },
  { t: 'txt', v: ' memory software in ' },
  { t: 'sh', vs: ['San Francisco', 'the Mission', 'a fog-rotted city', 'SF'] },
  { t: 'txt', v: ' at a place called ' },
  { t: 'dv', label: 'Engramme', into: [
    { t: 'txt', v: 'A startup in SF ' },
    { t: 'sh', vs: ['building', 'engineering', 'cobbling together', 'reverse-engineering'] },
    { t: 'txt', v: ' a long-term memory layer for personal AI. I do ' },
    { t: 'sh', vs: ['entity resolution', 'forensic identification', 'figuring out who is who'] },
    { t: 'txt', v: ' across audio, screen captures, and chat — given a sentence with no proper nouns, who is being talked about. I also wrote the iOS keyboard extension. The lab is run by people from Harvard.' },
  ]},
  { t: 'txt', v: '. Before that I was at ' },
  { t: 'sh', vs: ['Northeastern', 'a school in Boston', 'a co-op-shaped university'] },
  { t: 'txt', v: '; before that, a teenager in ' },
  { t: 'dv', label: 'Sugar Land', into: [
    { t: 'txt', v: 'A ' },
    { t: 'sh', vs: ['suburb', 'planned community', 'sub-development', 'master-planned grid'] },
    { t: 'txt', v: ' of Houston. I learned ' },
    { t: 'sh', vs: ['most of what I know about', 'surprisingly much', 'nearly all I needed of'] },
    { t: 'txt', v: ' world geography there because there was nothing else to do. Every state capital, every African border, every -stan. I can still draw a ' },
    { t: 'sh', vs: ['reasonable', 'passable', 'weirdly accurate', 'embarrassingly close'] },
    { t: 'txt', v: ' freehand world map.' },
  ]},
  { t: 'txt', v: '; before that, two stints elsewhere in America; and before that, ' },
  { t: 'sh', vs: ['born', 'made', 'minted', 'first assembled'] },
  { t: 'txt', v: ' in Bangalore. I keep ' },
  { t: 'sh', vs: ['a list', 'a folder', 'an ongoing tally', 'a small ledger'] },
  { t: 'txt', v: ' of things I would ' },
  { t: 'sh', vs: ['argue with', 'fight', 'make a small enemy over', 'go to the mat for'] },
  { t: 'txt', v: ' a stranger about: the year ' },
  { t: 'dv', label: 'shoegaze', into: [
    { t: 'txt', v: 'The case for 1991 is straightforward — Loveless came out in November. After that everyone was just ' },
    { t: 'sh', vs: ['responding to it', 'arguing with it', 'trying to escape its gravity'] },
    { t: 'txt', v: '. Cocteau Twins had already done their thing and Slowdive was about to do theirs. Three ' },
    { t: 'sh', vs: ['dream-pop', 'shimmery', 'unreasonably beautiful'] },
    { t: 'txt', v: ' albums in eighteen months and then the genre was ' },
    { t: 'sh', vs: ['sealed', 'done', 'too self-conscious to keep being itself'] },
    { t: 'txt', v: '.' },
  ]},
  { t: 'txt', v: ' definitively peaked, whether ' },
  { t: 'dv', label: 'Belgium', into: [
    { t: 'txt', v: 'I built a Policy Playground for an EU body: a recommender that helps fund-makers find which of their thousands of grant proposals are least redundant. I spent enough time on the train between Brussels and Leuven to develop strong opinions about ' },
    { t: 'sh', vs: ['Belgian crows', "the stationmaster's accent", 'which lines run on time', 'frites geometry'] },
    { t: 'txt', v: '.' },
  ]},
  { t: 'txt', v: ' is actually a country, and the ' },
  { t: 'sh', vs: ['moral', 'utilitarian', 'quietly obvious'] },
  { t: 'txt', v: ' case for taking ' },
  { t: 'dv', label: 'birds', into: [
    { t: 'txt', v: 'I built a CNN that ' },
    { t: 'sh', vs: ['estimates', 'guesses', 'makes an educated stab at'] },
    { t: 'txt', v: ' the year a satellite photo was taken using only the biodiversity visible in it. I built a Flask app that predicts where birds will be at dusk. I think the average person ' },
    { t: 'sh', vs: ['has paid less attention to', 'underestimates', 'has not stopped to look at'] },
    { t: 'txt', v: ' a bird in their lifetime and I think this is ' },
    { t: 'sh', vs: ['a moral failure', 'a quiet poverty', 'vaguely sad', 'a soluble problem'] },
    { t: 'txt', v: '.' },
  ]},
  { t: 'txt', v: ' more seriously. The rest of this page is here if you click into it.' },
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
      }, 350);
    };
    const t = setTimeout(tick, 7000 + Math.random() * 6000);
    return () => clearTimeout(t);
  }, [idx, values.length]);
  return <span className={`shimmer ${fade ? 'in' : 'out'}`}>{values[idx]}</span>;
}

function Prose({ frags, depth = 0 }: { frags: Frag[]; depth?: number }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="prose" data-depth={depth}>
      <p className="proseLine">
        {frags.map((f, i) => {
          if (f.t === 'txt') return <span key={i}>{f.v}</span>;
          if (f.t === 'sh') return <Shimmer key={i} values={f.vs} />;
          const isOpen = openIdx === i;
          return (
            <button key={i} className={`dive ${isOpen ? 'open' : ''}`} onClick={e => { e.stopPropagation(); setOpenIdx(isOpen ? null : i); }}>
              {f.label}
            </button>
          );
        })}
      </p>
      {openIdx !== null && frags[openIdx].t === 'dv' && (
        <div className="diveBox">
          <Prose frags={(frags[openIdx] as { into: Frag[] }).into} depth={depth + 1} />
        </div>
      )}
    </div>
  );
}

const BrainLanding = () => {
  const [isMobile, setIsMobile] = useState(false);

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
    <div className="brainLanding">
      <Aquarium />
      <div className="bgVignette" />
      <div className="bgGrain" />

      {/* Moon: anchored to right edge */}
      <div className="moonAnchor"><Moon /></div>

      {/* Content: lives on left half */}
      <div className="heroWrap">
        <h1 className="heroTitle">Guha&nbsp;Mahesh</h1>
        <p className="heroOrnament">— a small dossier —</p>
        <div className="proseWrap">
          <Prose frags={ROOT} />
        </div>
        <p className="instr">click the underlined words to fall through · the page is restless on purpose</p>
      </div>

      <div className="floatingActions">
        <a href="https://github.com/guha-mahesh" target="_blank" rel="noopener noreferrer" className="floatingButton" title="GitHub"><FaGithub /></a>
        <a href="https://linkedin.com/in/guhamahesh" target="_blank" rel="noopener noreferrer" className="floatingButton" title="LinkedIn"><FaLinkedin /></a>
      </div>
    </div>
  );
};

export default BrainLanding;
