import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  DeadTree, Hollow, Waterwheel, Splash, Factory, Effluent, Smoke,
  River, Ridge, Vulture, Scribe, Squirrel,
  Beetle, Mushrooms, Moth, FactoryGuts, DeepMass, Waterline,
} from "./NoriaArt";
import Grain from "./Grain";
import Tartan from "./Tartan";
import Bite from "./Bite";
import RaptorPanel from "./RaptorPanel";
import { useCreak } from "./useCreak";
import "./Noria.css";

/**
 * Orchestrator. NoriaArt draws the objects; this file decides where each one
 * stands, what the camera does when you click it, and what it has to say.
 *
 * There is no navigation. You click the thing itself: the tree, the hollow
 * at its foot, the wheel, the factory, the man in front taking notes. Each
 * object owns a camera pose, and the rig flies there. Panels are placed in
 * world space at that pose and pre-rotated by its inverse, so they land
 * square to the viewer once the move settles.
 *
 * Only the TOPICS are real. Panel bodies are lorem for Guha to overwrite.
 */

// ── camera ───────────────────────────────────────────────────────────
/** A camera pose: where it looks (tx,ty,tz), how it is turned, how close. */
type Shot = { tx: number; ty: number; tz: number; yaw: number; pitch: number; dist: number };

const HOME: Shot = { tx: 0, ty: -40, tz: -300, yaw: 0, pitch: 0, dist: 0 };

/* The stage's perspective depth is 900px (see .crimStage); every shot's
   `dist` stays well under that so the world never passes through the lens. */

type Channel = keyof Shot;
const CHANNELS: Channel[] = ["tx", "ty", "tz", "yaw", "pitch", "dist"];

/**
 * Critically-ish damped spring per channel, integrated on rAF and written
 * straight to the element's transform. No React re-render while flying.
 */
function useCameraRig(
  worldRef: React.RefObject<HTMLDivElement | null>,
  shot: Shot,
  still: boolean,
  engaged: boolean,
) {
  const pos = useRef<Shot>({ ...HOME });
  const vel = useRef<Record<Channel, number>>({ tx: 0, ty: 0, tz: 0, yaw: 0, pitch: 0, dist: 0 });
  const target = useRef<Shot>(shot);
  // 0 while parked at the establishing frame, 1 once inside a shot. Free-look
  // and idle drift scale by this, so the home frame stays flat and locked.
  const eng = useRef(0);
  const engTarget = useRef(0);
  const lastWritten = useRef("");
  target.current = shot;
  engTarget.current = engaged ? 1 : 0;

  useEffect(() => {
    if (still) {
      const s = target.current;
      if (worldRef.current) {
        worldRef.current.style.transform =
          `translate3d(0,0,${s.dist}px) rotateX(${s.pitch}deg) rotateY(${s.yaw}deg) translate3d(${-s.tx}px,${-s.ty}px,${-s.tz}px)`;
      }
      return;
    }

    let raf = 0;
    let last = performance.now();
    const K = 46;   // stiffness
    const C = 13.5; // damping

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const t = target.current;
      const p = pos.current;
      const v = vel.current;

      for (const c of CHANNELS) {
        const a = -K * (p[c] - t[c]) - C * v[c];
        v[c] += a * dt;
        p[c] += v[c] * dt;
      }

      // ease the free-look weight in and out rather than snapping it
      eng.current += (engTarget.current - eng.current) * Math.min(1, dt * 3.2);
      const w = eng.current;

      // idle breath and pointer look, both only once you are inside a shot
      const breath = now / 1000;
      const bx = Math.sin(breath * 0.23) * 7 * w;
      const by = Math.cos(breath * 0.19) * 5 * w;
      const byaw = Math.sin(breath * 0.16) * 0.5 * w;

      const yaw = p.yaw + byaw;
      const pitch = p.pitch;

      const next =
        `translate3d(0,0,${p.dist.toFixed(2)}px) rotateX(${pitch.toFixed(3)}deg) rotateY(${yaw.toFixed(3)}deg) ` +
        `translate3d(${(-(p.tx + bx)).toFixed(2)}px,${(-(p.ty + by)).toFixed(2)}px,${(-p.tz).toFixed(2)}px)`;
      // Writing an identical transform still invalidates the whole 3D subtree
      // and forces the overlay stack to repaint. When the spring has settled
      // and nothing is drifting, this is the difference between an idle page
      // and one repainting the viewport sixty times a second.
      if (worldRef.current && next !== lastWritten.current) {
        worldRef.current.style.transform = next;
        lastWritten.current = next;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [worldRef, still]);

}

// ── content ──────────────────────────────────────────────────────────
const LOREM_1 =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";
const LOREM_2 =
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.";
const LOREM_ITEMS = [
  "Lorem ipsum dolor sit amet",
  "Consectetur adipiscing elit sed do",
  "Eiusmod tempor incididunt ut labore",
  "Dolore magna aliqua ut enim",
];

/** Where a thing stands in the world. */
type Place = { x: number; y: number; z: number; s?: number; rot?: string; fade?: number };

type Thing = {
  key: string;
  label: string;
  place: Place;
  shot: Shot;
  panel: { ox: number; oy: number };
  body: ReactNode;
  art: ReactNode;
};

/* Layout, left to right: the tree alone on the left, the wheel centre-right
   where the race pinches, the factory on the right feeding that race, the
   observer close in front. Everything else is scenery. */
const THINGS: Thing[] = [
  {
    key: "engramme",
    label: "engramme",
    place: { x: -683, y: 44, z: -560, s: 0.78 },
    shot: { tx: -683, ty: 196, tz: -560, yaw: -9, pitch: -4, dist: 360 },
    panel: { ox: 430, oy: 40 },
    art: <DeadTree />,
    body: (<><p>{LOREM_1}</p><p>{LOREM_2}</p></>),
  },
  {
    key: "read",
    label: "the hollow",
    place: { x: -631, y: 158, z: -516 },
    shot: { tx: -631, ty: 158, tz: -516, yaw: -5, pitch: -3, dist: 640 },
    panel: { ox: 250, oy: 40 },
    art: <Hollow />,
    body: (<ul className="rawlist">{LOREM_ITEMS.map((t) => <li key={t}>{t}</li>)}</ul>),
  },
  {
    key: "sounds",
    label: "sounds",
    place: { x: -143, y: 246, z: -390, s: 0.86 },
    shot: { tx: -143, ty: 232, tz: -390, yaw: 2, pitch: -2, dist: 400 },
    panel: { ox: -280, oy: -40 },
    art: <Waterwheel />,
    body: (<><p>{LOREM_1}</p></>),
  },
  {
    key: "built",
    label: "built",
    place: { x: 1339, y: 320, z: -1150, s: 2.6 },
    shot: { tx: 1339, ty: 250, tz: -1150, yaw: 8, pitch: 2, dist: 640 },
    panel: { ox: -270, oy: 70 },
    art: <Factory />,
    body: (<><p>{LOREM_2}</p><ul className="rawlist">{LOREM_ITEMS.map((t) => <li key={t}>{t}</li>)}</ul></>),
  },
  {
    key: "vulture",
    label: "the bird",
    place: { x: -430, y: -540, z: -1050, s: 1.05 },
    shot: { tx: -430, ty: -540, tz: -1050, yaw: -3, pitch: -6, dist: 700 },
    panel: { ox: -300, oy: 190 },
    art: <Vulture />,
    body: null, // the drawing is the content here
  },
  {
    key: "who",
    label: "who",
    place: { x: -212, y: 128, z: 40, s: 0.62 },
    shot: { tx: -212, ty: 100, tz: 40, yaw: -2, pitch: -2, dist: 170 },
    panel: { ox: 300, oy: -30 },
    art: <Scribe />,
    body: null, // replaced by the conversation
  },
];


/**
 * The man will talk, in his fashion. He does not stop writing while he does.
 * Replace the lines; the shape is a small graph, so any node can point at
 * any other and an `end` closes the exchange.
 */
type Line = { says: string; choices?: { ask: string; to: string }[] };

const TALK: Record<string, Line> = {
  start: {
    says: "He does not look up. The pen moves the wrong way round, nib in the air, and the page fills anyway.",
    choices: [
      { ask: "what are you writing", to: "writing" },
      { ask: "who are you", to: "who" },
      { ask: "why backwards", to: "pen" },
    ],
  },
  writing: {
    says: "Lorem ipsum dolor sit amet. Everything that happens here, in the order it happens. The wheel turns, so there is always something to put down.",
    choices: [
      { ask: "does anyone read it", to: "read" },
      { ask: "why backwards", to: "pen" },
      { ask: "step back", to: "end" },
    ],
  },
  who: {
    says: "Consectetur adipiscing elit. He gives a name that is not quite the one on the header, and goes back to the page.",
    choices: [
      { ask: "what are you writing", to: "writing" },
      { ask: "step back", to: "end" },
    ],
  },
  pen: {
    says: "Sed do eiusmod tempor. He turns the pen over, considers it, and puts it back the way it was.",
    choices: [
      { ask: "does anyone read it", to: "read" },
      { ask: "step back", to: "end" },
    ],
  },
  read: {
    says: "Ut enim ad minim veniam. The bird does, he says. Not kindly.",
    choices: [
      { ask: "start again", to: "start" },
      { ask: "step back", to: "end" },
    ],
  },
  end: { says: "" },
};

function Conversation({ onClose }: { onClose: () => void }) {
  const [at, setAt] = useState("start");
  const line = TALK[at];

  useEffect(() => { if (at === "end") onClose(); }, [at, onClose]);
  if (at === "end") return null;

  return (
    <div className="talk">
      <p className="talkSays">{line.says}</p>
      <div className="talkChoices">
        {line.choices?.map((c) => (
          <button key={c.ask} className="talkAsk" onClick={() => setAt(c.to)}>
            {c.ask}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── placement ────────────────────────────────────────────────────────
function styleFor({ x, y, z, s = 1, rot = "", fade = 0 }: Place): CSSProperties {
  return {
    // the trailing translate centres the box on its own size, so the element's
    // hit area sits exactly where the art is drawn. Centring with negative
    // margins on the child would move the drawing and leave the box behind.
    transform: `translate3d(${x}px,${y}px,${z}px) ${rot} scale(${s}) translate(-50%,-50%)`,
    opacity: 1 - fade,
  };
}

/** Scenery: placed, never clickable. */
function Prop({ place, className = "", children }: { place: Place; className?: string; children: ReactNode }) {
  return <div className={`prop ${className}`} style={styleFor(place)}>{children}</div>;
}

/** Detail that only exists once the camera has come to look at it. */
function Detail({ place, show, className = "", children }: {
  place: Place; show: boolean; className?: string; children: ReactNode;
}) {
  return (
    <div className={`prop detail ${className} ${show ? "lit" : ""}`} style={styleFor(place)}>{children}</div>
  );
}

// ── page ─────────────────────────────────────────────────────────────
export default function Noria() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const open = THINGS.find((t) => t.key === openKey) ?? null;
  const hover = THINGS.find((t) => t.key === hoverKey) ?? null;
  const [sound, toggleSound] = useCreak();
  // the tree and its hollow share one interior
  const atTree = openKey === "engramme" || openKey === "read";
  const ridges = useMemo(() => [0x51ae, 0x7c31], []);

  const still = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useCameraRig(worldRef, open?.shot ?? HOME, !!still, !!open);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenKey(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="crim">
      <div className="crimStage">
        <div className="crimWorld" ref={worldRef}>

          {/* ── background: ridges and the bird ── */}
          <Prop place={{ x: 60, y: 386, z: -2200, s: 3.4 }} className="far"><Ridge seed={ridges[0]} /></Prop>

          {/* ── the ground, and the river laid flat on it ── */}
          <Prop place={{ x: 0, y: 342, z: -1100, rot: "rotateX(90deg)" }} className="ground">
            <div className="groundFace" />
          </Prop>
          <Prop place={{ x: 120, y: 334, z: -430, rot: "rotateX(90deg)", s: 2.3 }} className="riverPlane"><River /></Prop>

          {/* ── the machine: factory venting into the race that drives the wheel ── */}
          <Prop place={{ x: 1278, y: -40, z: -1140, s: 2.2, fade: 0.3 }}><Smoke /></Prop>
          <Prop place={{ x: 1418, y: 50, z: -1140, s: 2.2, fade: 0.35 }}><Smoke delay={-5.5} /></Prop>
          <Prop place={{ x: 900, y: 330, z: -900, s: 1.6 }}><Effluent /></Prop>
          <Prop place={{ x: -143, y: 336, z: -376 }}><Splash /></Prop>
          {/* cuts the wheel where it enters the race */}
          <Prop place={{ x: -143, y: 352, z: -370, s: 1.1 }} className="waterline"><Waterline /></Prop>
          {/* something long under the surface, only its back showing */}
          <Prop place={{ x: 640, y: 322, z: -900, s: 2.1 }} className="submerged"><DeepMass /></Prop>

          {/* The same tree again, smaller and further back. Same seed, so it
              is not a similar tree, it is the same tree. Nobody notices for
              a moment, and then they do. */}
          <Prop place={{ x: 60, y: 96, z: -1420, s: 0.5, fade: 0.28 }}><DeadTree /></Prop>

          {/* ── the clickable things ── */}
          {THINGS.map((t) => (
            <div
              key={t.key}
              className={`prop thing ${openKey === t.key ? "open" : ""} ${hoverKey === t.key ? "hot" : ""} ${
                t.key === "vulture" && openKey === "vulture" ? "silenced" : ""
              }`}
              style={styleFor(t.place)}
              onPointerEnter={() => setHoverKey(t.key)}
              onPointerLeave={() => setHoverKey((k) => (k === t.key ? null : k))}
              onClick={() => setOpenKey(openKey === t.key ? null : t.key)}
              role="button"
              tabIndex={0}
              aria-label={t.label}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpenKey(openKey === t.key ? null : t.key); }}
            >
              {t.art}
            </div>
          ))}

          {/* ── life at the tree's foot, only once you are down there ── */}
          {/* the tree's ecosystem: nothing here exists until you are down at the roots */}
          <Detail place={{ x: -560, y: 306, z: -540, s: 0.5 }} show={atTree}><Squirrel /></Detail>
          <Detail place={{ x: -790, y: 326, z: -536, s: 0.45 }} show={atTree}><Mushrooms /></Detail>
          <Detail place={{ x: -500, y: 332, z: -530, s: 0.5 }} show={atTree} className="crawling"><Beetle /></Detail>
          <Detail place={{ x: -610, y: 236, z: -520, s: 0.5 }} show={atTree} className="fluttering"><Moth /></Detail>

          {/* the shed's working parts */}
          <Detail place={{ x: 1339, y: 330, z: -1140, s: 1.5 }} show={openKey === "built"}><FactoryGuts /></Detail>

          {/* ── the panel, placed at the shot and turned to face the camera ── */}
          {open && open.key !== "vulture" && (
            <div
              className="crimPanel"
              key={open.key}
              style={{
                transform:
                  `translate3d(${open.shot.tx}px,${open.shot.ty}px,${open.shot.tz}px) ` +
                  `rotateY(${-open.shot.yaw}deg) rotateX(${-open.shot.pitch}deg) ` +
                  `translate3d(${open.panel.ox}px,${open.panel.oy}px,${-open.shot.dist}px)`,
              }}
            >
              <div className="crimPanelName">{open.label}</div>
              {open.key === "who"
                ? <Conversation onClose={() => setOpenKey(null)} />
                : open.body}
              <button className="crimClose" onClick={() => setOpenKey(null)}>step back</button>
            </div>
          )}
        </div>
      </div>

      {/* going to the bird leaves the plate behind and opens a comic page */}
      {openKey === "vulture" && <RaptorPanel onClose={() => setOpenKey(null)} />}

      {/* the cloth, generated once and handed to CSS */}
      <Tartan />
      {/* the whole atmosphere, drawn once into one layer */}
      <Grain />

      {/* something is taking the corner of the plate */}
      <Bite />
      <div className="crimHorizon" aria-hidden />
      <div className="crimPlate" aria-hidden />
      <div className="crimPlateCap" aria-hidden>pl. i — the noria</div>

      <header className="crimHead">
        <h1>guha</h1>
        <p className="crimSub">De hac re submisse loquere, sed non assidue.</p>
      </header>

      {/* the only readout: what your cursor is over */}
      <div className={`crimReadout ${hover && !open ? "up" : ""}`} aria-hidden>
        {hover?.label ?? ""}
      </div>

      <a className="crimLeave" href="/">leave</a>

      <button className="crimSound" onClick={toggleSound} aria-pressed={sound}>
        {sound ? "sound ■" : "sound □"}
      </button>
    </div>
  );
}
