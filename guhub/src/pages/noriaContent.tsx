/**
 * Everything the plate has to say, in one place.
 *
 * Both renderers read this file: the desktop world (Noria.tsx) hangs these
 * bodies off the objects you click, and the phone (NoriaPlates.tsx) sets the
 * same bodies under the same figures as a book of plates. Nothing here knows
 * which one is drawing it, so the two can never drift apart.
 */
import { resumeData } from "../data/resumeData";

// ── projects ─────────────────────────────────────────────────────────
/**
 * Only things that were actually built and kept being worked on. A repo with
 * four commits in it is a weekend, not a project, and it does not go up here.
 */
type Built = {
  name: string;
  /** one line, semicolons, no adjectives that are not doing work */
  line: string;
  stack: string;
  href?: string;
};

const BUILT: Built[] = [
  {
    name: "arbor",
    line: "profile cards for the things you are into; you pick which URLs your card shows up on, and anyone with the extension sees it there; covers anything a person can be into, not just music",
    stack: "Next.js · TypeScript · Postgres",
    href: "https://arbor-blue.vercel.app",
  },
  {
    name: "policy playground",
    line: "regression models that forecast market indicators, paired with a recommender that suggests policy given the forecast",
    stack: "Python · Flask · MySQL · scikit-learn",
    href: "https://github.com/guha-mahesh/PolicyPlayground",
  },
  {
    name: "clubstop",
    line: "students find and rate university clubs on five metrics; sortable by flair, with accounts and a club management interface",
    stack: "React · TypeScript · Express · MySQL",
    href: "https://github.com/guha-mahesh/ClubStop",
  },
  {
    name: "bioclock",
    line: "CNN that predicts local biodiversity from satellite imagery; 80% after augmenting the training set; imagery sourced through Google Earth Engine",
    stack: "Python · PyTorch · Google Earth Engine",
    href: "https://github.com/guha-mahesh/BioClock",
  },
  {
    name: "flightscope",
    line: "predicts where and when a given bird species is likely to be seen; one Poisson regression per species over location and environment features",
    stack: "Python · Flask · React · scikit-learn",
    href: "https://github.com/guha-mahesh/FlightScope",
  },
];

export function BuiltList() {
  return (
    <ul className="builtList">
      {BUILT.map((b) => (
        <li key={b.name} className="builtItem">
          <span className="builtName">
            {b.href
              ? <a className="crimLink" href={b.href} target="_blank" rel="noopener noreferrer">{b.name}</a>
              : b.name}
          </span>
          <span className="builtLine">{b.line}</span>
          <span className="builtStack">{b.stack}</span>
        </li>
      ))}
    </ul>
  );
}

// ── the tree: who he is ──────────────────────────────────────────────
export function WhoBody() {
  return (
    <>
      <p>
        Guha. Northeastern, data science and business analytics, 2028. On a gap
        year at the moment.
      </p>
      <p>
        Nine months of it went to a human-memory lab out of Harvard. The rest
        of that is on the scribe's page.
      </p>
      <p>
        Shoegaze. Competitive typing. Metaethics, effective altruism, animal
        welfare, geopolitics.
      </p>
      <p>
        Every line on this plate is cut by hand. Nothing here is a stock
        illustration and nothing is a template.
      </p>
    </>
  );
}

// ── the wheel: every way off the page ────────────────────────────────
/** Ordered as the wheel turns: the work, the professional face, the rest. */
const ELSEWHERE = [
  { label: "github", href: "https://github.com/guha-mahesh" },
  { label: "linkedin", href: "https://linkedin.com/in/guhamahesh" },
  { label: "instagram", href: "https://instagram.com/guha._" },
  { label: "the covers", href: "/listening" },
];

export function ElsewhereBody() {
  return (
    <ul className="rawlist">
      {ELSEWHERE.map((e) => {
        // the covers page is this site; the rest are somewhere else entirely
        const away = !e.href.startsWith("/");
        return (
          <li key={e.label}>
            <a
              className="crimLink"
              href={e.href}
              target={away ? "_blank" : undefined}
              rel={away ? "noopener noreferrer" : undefined}
            >
              {e.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// ── the scribe: the page he is filling ───────────────────────────────
/**
 * The resume, set as the sheet under his pen. Each line carries its index so
 * the ink can arrive in order rather than all at once; see .inkLine.
 */
type Sheet = { kind: "rule" } | { kind: "head"; text: string; meta?: string } | { kind: "line"; text: string };

/**
 * The sheet is a page, not a folder, so it does not print the CV bullets: they
 * run four lines each. The dates, schools, companies and titles still come off
 * resumeData so they cannot drift from the real document; only the prose is
 * written short for this panel, keyed by the company it belongs to.
 */
const SHORT_LINES: Record<string, string[]> = {
  "Engramme (fka. Memory Machines)": [
    "built eight clients on one memory API: iOS and macOS in Swift, the Chrome extension, the web platform, a menubar app, a VS Code extension, the Meta Ray-Bans, and an Android build for Samsung driving a glasses HUD",
    "built the Google, iMessage and WhatsApp, and Plaud integrations into the shared ingest pipeline",
    "built the ECAPA voiceprint and diarisation pipeline behind Plaud recorders and Meet calls, and split it into a media service of its own",
    "took entity prediction from research into production: five-feature MLP, held-out-of-held-out evaluation, Terraform and Cloud Run, serving into the live recall path",
    "co-authored the paper benchmarking our recall against Letta and Mem0 over a 418-question test set under both an LLM and a human judge, and helped decide what went into the benchmark",
    "co-authored a position paper submitted to NeurIPS",
    "helped design, run and analyse a 134-person Prolific study on what people need to recall, and co-wrote the post",
    "ran the beta programme: the testers, their feedback, and the analysis that fed back into the models",
    "nine months as a co-op, converted to full-time MTS, deferred for a gap year",
  ],
  Knack: [
    "ten students through pandas, NumPy, statistics and EDA; five stars",
  ],
};

/** Strip the **bold** markers the CV bullets carry; the sheet is one ink. */
function plain(text: string): string {
  return text.replace(/\*\*/g, "");
}

/** The short copy where there is one, the CV's own bullets where there is not. */
function linesFor(company: string, bullets: string[]): string[] {
  return SHORT_LINES[company] ?? bullets.map(plain);
}

function sheetRows(): Sheet[] {
  const rows: Sheet[] = [
    { kind: "head", text: "Guha Mahesh", meta: "data science · software" },
    { kind: "rule" },
    { kind: "head", text: resumeData.education.school, meta: resumeData.education.date },
    { kind: "line", text: resumeData.education.degree },
    { kind: "line", text: resumeData.education.gpa },
    { kind: "rule" },
  ];

  for (const job of resumeData.experience) {
    rows.push({ kind: "head", text: `${job.company} · ${job.title}`, meta: job.date });
    for (const line of linesFor(job.company, job.bullets)) {
      rows.push({ kind: "line", text: line });
    }
  }

  rows.push({ kind: "rule" });
  rows.push({
    kind: "line",
    text: [...resumeData.skills.languages, ...resumeData.skills.tools].join(", "),
  });

  return rows;
}

export function SheetBody() {
  const rows = sheetRows();
  return (
    <div className="sheet">
      {rows.map((row, i) => {
        const style = { animationDelay: `${0.35 + i * 0.045}s` } as const;
        if (row.kind === "rule") return <div key={i} className="sheetRule inkLine" style={style} />;
        if (row.kind === "head") {
          return (
            <p key={i} className="sheetHead inkLine" style={style}>
              <span>{row.text}</span>
              {row.meta && <span className="sheetMeta">{row.meta}</span>}
            </p>
          );
        }
        return <p key={i} className="sheetLine inkLine" style={style}>{row.text}</p>;
      })}
    </div>
  );
}
