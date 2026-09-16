/**
 * The plate, for a phone.
 *
 * The desktop page is one landscape engraving you fly a camera around. A phone
 * is a portrait page and a thumb, so it gets the object the engraving came out
 * of: the book. One figure per page, ruled border, engraver's caption, the
 * note set underneath in letterpress. Scroll snapping does the page turn, and
 * an observer inks each figure in as it arrives rather than showing the whole
 * book finished at once.
 *
 * The figures and the words are the same ones the desktop uses (NoriaArt and
 * noriaContent); only the setting changes.
 */
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { DeadTree, Waterwheel, Factory, Scribe, Ridge } from "./NoriaArt";
import { EPIGRAPH, TOPIC_BODIES } from "./noriaTopics";
import Grain from "./Grain";
import Tartan from "./Tartan";
import Bite from "./Bite";
import "./Noria.css";
import "./NoriaPlates.css";

/** Roman numerals never get far here, so the table is the algorithm. */
const NUMERAL = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"];

type Plate = {
  key: string;
  /** what the caption calls the figure */
  caption: string;
  /** the heading over the note */
  label: string;
  /** the art is drawn at its own size, so each figure carries its own scale */
  scale: number;
  art: ReactNode;
  body: ReactNode;
};

const PLATES: Plate[] = [
  {
    key: "noria",
    caption: "the noria",
    label: "guha",
    scale: 0.82,
    art: <Waterwheel />,
    // The title page is the wheel, and the wheel's subject is sound. It also
    // carries every way off the page: the hollow is a hole in a tree, which
    // needs the tree around it to read as anything, so the phone takes its
    // links and leaves the drawing to the desktop.
    body: (
      <>
        <p className="plateEpigraph">{EPIGRAPH}</p>
        <div className="plateWays">{TOPIC_BODIES.elsewhere.body}</div>
        <p className="plateAside">open on desktop cus it's cooler</p>
      </>
    ),
  },
  {
    key: "who",
    caption: TOPIC_BODIES.who.caption,
    label: "who",
    scale: 0.5,
    art: <DeadTree />,
    body: TOPIC_BODIES.who.body,
  },
  {
    key: "built",
    caption: TOPIC_BODIES.built.caption,
    label: "built",
    scale: 0.62,
    art: <Factory />,
    body: TOPIC_BODIES.built.body,
  },
  {
    key: "record",
    caption: TOPIC_BODIES.record.caption,
    label: "the record",
    scale: 1.05,
    art: <Scribe />,
    body: TOPIC_BODIES.record.body,
  },
];

/**
 * Ink a page in when it arrives. One observer for the whole book; the class it
 * adds is what every reveal in NoriaPlates.css keys off, so nothing animates
 * on a page the reader has not reached.
 */
function useInkOnArrival(count: number) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [seen, setSeen] = useState<boolean[]>(() => Array(count).fill(false));

  useEffect(() => {
    const nodes = refs.current.filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setSeen((was) => {
          let changed = false;
          const next = [...was];
          for (const entry of entries) {
            const i = Number((entry.target as HTMLElement).dataset.plate);
            if (entry.isIntersecting && !next[i]) { next[i] = true; changed = true; }
          }
          return changed ? next : was;
        });
      },
      { threshold: 0.35 },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [count]);

  return { refs, seen };
}

export default function NoriaPlates() {
  const { refs, seen } = useInkOnArrival(PLATES.length);

  return (
    <div className="crim plateBook">
      {PLATES.map((plate, i) => (
        <section
          key={plate.key}
          data-plate={i}
          ref={(el) => { refs.current[i] = el; }}
          className={`plate ${seen[i] ? "inked" : ""} ${plate.key === "noria" ? "front" : ""}`}
        >
          <div className="plateRule" aria-hidden />

          <div className="plateFig">
            {/* the far ridge sits behind the frontispiece only, so the first
                page reads as a scene and the rest read as specimens */}
            {plate.key === "noria" && (
              <div className="plateRidge" aria-hidden><Ridge seed={0x51ae} /></div>
            )}
            <div className="plateArt" style={{ transform: `scale(${plate.scale})` }}>
              {plate.art}
            </div>
          </div>

          <div className="plateCap">
            <span className="plateNo">pl. {NUMERAL[i]}</span>
            <span className="plateCapRule" aria-hidden />
            <span className="plateCapName">{plate.caption}</span>
          </div>

          <div className="plateNote">
            <h2 className="plateLabel">{plate.label}</h2>
            <div className="plateBody">{plate.body}</div>
          </div>

          {i < PLATES.length - 1 && <div className="plateTurn" aria-hidden>turn</div>}
        </section>
      ))}

      <Bite />
      <Tartan />
      <Grain />
    </div>
  );
}
