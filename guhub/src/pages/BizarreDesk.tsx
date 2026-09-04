import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import "./BizarreDesk.css";

/**
 * A deliberately strange, minimal room. Everything on the desk is a real
 * physics body you can grab, drag and fling. Rendered as DOM synced to
 * matter-js so each item can be its own weird little widget.
 *
 * Fixed fullscreen so it completely replaces the site chrome -- this page
 * is meant to feel like a different site entirely.
 */

type Item = {
  id: string;
  kind: "note" | "vinyl" | "recorder" | "floppy" | "die" | "stamp" | "matchbox" | "clip";
  w: number;
  h: number;
  x: number;
  y: number;
  body?: Matter.Body;
  el?: HTMLDivElement | null;
};

const NOTE_LINES = [
  "feed the\nanteater?",
  "you are\nhere ↴",
  "do NOT\nopen the\nfloppy",
  "remember\nthe tape",
];

function makeItems(width: number, height: number): Item[] {
  const cx = width / 2;
  const cy = height / 2;
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const scatter = (base: number, spread: number) => base + rand(-spread, spread);

  const items: Item[] = [];
  NOTE_LINES.forEach((_, i) =>
    items.push({
      id: "note-" + i,
      kind: "note",
      w: 132,
      h: 132,
      x: scatter(cx - 220 + i * 150, 40),
      y: scatter(cy - 60, 90),
    })
  );
  items.push({ id: "vinyl", kind: "vinyl", w: 170, h: 170, x: scatter(cx + 200, 40), y: scatter(cy + 40, 40) });
  items.push({ id: "recorder", kind: "recorder", w: 210, h: 130, x: scatter(cx - 120, 40), y: scatter(cy + 120, 30) });
  items.push({ id: "floppy", kind: "floppy", w: 108, h: 108, x: scatter(cx + 40, 60), y: scatter(cy - 120, 40) });
  items.push({ id: "die", kind: "die", w: 62, h: 62, x: scatter(cx - 260, 40), y: scatter(cy + 40, 40) });
  items.push({ id: "stamp", kind: "stamp", w: 84, h: 96, x: scatter(cx + 300, 40), y: scatter(cy - 90, 40) });
  items.push({ id: "matchbox", kind: "matchbox", w: 118, h: 74, x: scatter(cx + 260, 50), y: scatter(cy + 150, 30) });
  items.push({ id: "clip", kind: "clip", w: 54, h: 90, x: scatter(cx - 40, 60), y: scatter(cy + 200, 30) });
  return items;
}

export default function BizarreDesk() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [items] = useState<Item[]>(() =>
    makeItems(window.innerWidth, window.innerHeight)
  );
  const [dark, setDark] = useState(true);
  const [tapePlaying, setTapePlaying] = useState(false);
  const [vinylSpin, setVinylSpin] = useState(0);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const engine = Matter.Engine.create();
    // Zero gravity: the desk floats. Flung items drift and slowly settle.
    engine.gravity.x = 0;
    engine.gravity.y = 0;

    const world = engine.world;

    const wallThickness = 200;
    const wallOptions = { isStatic: true, restitution: 0.9, render: { visible: false } };
    Matter.World.add(world, [
      Matter.Bodies.rectangle(width / 2, -wallThickness / 2, width + wallThickness * 2, wallThickness, wallOptions),
      Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width + wallThickness * 2, wallThickness, wallOptions),
      Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, wallOptions),
      Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, wallOptions),
    ]);

    for (const item of items) {
      const isRound = item.kind === "vinyl" || item.kind === "die";
      const body = isRound
        ? Matter.Bodies.circle(item.x, item.y, item.w / 2, {
            restitution: 0.6,
            frictionAir: 0.03,
            angle: Math.random() * Math.PI,
          })
        : Matter.Bodies.rectangle(item.x, item.y, item.w, item.h, {
            restitution: 0.5,
            frictionAir: 0.04,
            chamfer: { radius: 8 },
            angle: (Math.random() - 0.5) * 0.5,
          });
      item.body = body;
      Matter.World.add(world, body);
    }

    const mouse = Matter.Mouse.create(sceneRef.current as HTMLElement);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.World.add(world, mouseConstraint);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    let frame = 0;
    const sync = () => {
      for (const item of items) {
        const el = itemRefs.current[item.id];
        if (!el || !item.body) continue;
        const { x, y } = item.body.position;
        const angle = item.body.angle;
        el.style.transform =
          "translate(" + (x - item.w / 2) + "px," + (y - item.h / 2) + "px) rotate(" + angle + "rad)";
      }
      // Vinyl keeps its own spin, sped up by how fast it's moving.
      const vinyl = items.find((it) => it.id === "vinyl");
      if (vinyl?.body) {
        const speed = Math.hypot(vinyl.body.velocity.x, vinyl.body.velocity.y);
        setVinylSpin((prev) => prev + 1 + speed * 1.2);
      }
      frame = requestAnimationFrame(sync);
    };
    frame = requestAnimationFrame(sync);

    return () => {
      cancelAnimationFrame(frame);
      Matter.Runner.stop(runner);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
    // items is created once via useState initialiser; intentionally run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={"deskRoot" + (dark ? " deskDark" : " deskDim")}>
      <div className="deskGrain" />

      <div className="deskHud">
        <span className="deskWord">a desk, mostly</span>
        <span className="deskHint">grab things. throw them. nothing is load-bearing.</span>
      </div>

      <button
        className="lightSwitch"
        onClick={() => setDark((d) => !d)}
        aria-label="toggle the light"
      >
        <span className="switchNub" data-on={dark ? "false" : "true"} />
        <span className="switchLabel">{dark ? "lights" : "gloom"}</span>
      </button>

      <div className="deskScene" ref={sceneRef}>
        {items.map((item) => (
          <div
            key={item.id}
            ref={(el) => {
              itemRefs.current[item.id] = el;
            }}
            className={"item item-" + item.kind}
            style={{ width: item.w, height: item.h }}
          >
            {item.kind === "note" && (
              <div
                className="noteFace"
                contentEditable
                suppressContentEditableWarning
                onPointerDown={(e) => e.stopPropagation()}
              >
                {NOTE_LINES[Number(item.id.split("-")[1])]}
              </div>
            )}

            {item.kind === "vinyl" && (
              <div className="vinylFace" style={{ transform: "rotate(" + vinylSpin + "deg)" }}>
                <div className="vinylGrooves" />
                <div className="vinylLabel">B-SIDE</div>
                <div className="vinylHole" />
              </div>
            )}

            {item.kind === "recorder" && (
              <div
                className={"recorderFace" + (tapePlaying ? " playing" : "")}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setTapePlaying((p) => !p);
                }}
              >
                <div className="reels">
                  <span className="reel" />
                  <span className="tapeWindow">{tapePlaying ? "▶ …hiss…" : "■ stopped"}</span>
                  <span className="reel" />
                </div>
                <div className="recorderKeys">
                  <span /> <span /> <span className="recDot" /> <span />
                </div>
              </div>
            )}

            {item.kind === "floppy" && (
              <div className="floppyFace">
                <div className="floppyShutter" />
                <div className="floppyLabel">do_not_open</div>
              </div>
            )}

            {item.kind === "die" && <div className="dieFace">⚄</div>}
            {item.kind === "stamp" && (
              <div className="stampFace">
                <span>PAID</span>
                <small>in full</small>
              </div>
            )}
            {item.kind === "matchbox" && (
              <div className="matchboxFace">
                <span className="strike" />
                <span className="matchLabel">STRIKE ANYWHERE</span>
              </div>
            )}
            {item.kind === "clip" && <div className="clipFace" />}
          </div>
        ))}
      </div>

      <div className="deskFooter">
        <a href="/">← back to the real one</a>
        <span>guhub // b-side</span>
      </div>
    </div>
  );
}
