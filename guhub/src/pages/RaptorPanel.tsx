/**
 * The bird, as a panel torn out of a different book.
 *
 * When you go to the vulture the plate stops being a plate: this takes the
 * whole screen as a comic page. Cream stock, rose ink, ruled border, halftone,
 * speed lines and a lettered BANG. Rose gold is the HUE of the whole page
 * rather than the fill of the bird, which is why the paper is warm cream and
 * every line is a warm brown-rose instead of black.
 *
 * The bird itself is built from spot blacks: one heavy mass with cream cut
 * back out of it. Uniform outlines around light fills is coloring-book
 * grammar, and it is what made every earlier attempt read as a cartoon.
 */

const C = {
  paper: "#f2e7d5",
  paperHi: "#fbf4e7",
  ink: "#3a201a",
  inkSoft: "#6b3b30",
  rose: "#d4705c",
  roseDeep: "#a8452f",
  roseLt: "#e9a48d",
  gold: "#c98a5a",
};

/** parallel motion streaks along the dive axis */
const STREAKS = Array.from({ length: 34 }, (_, i) => {
  const t = i / 33;
  const y = -260 + t * 1180;
  const len = 300 + ((i * 137) % 520);
  const w = i % 4 === 0 ? 3.2 : i % 3 === 0 ? 1.8 : 1;
  return { y, len, w, op: 0.1 + ((i * 53) % 30) / 100 };
});

/** the jagged burst behind the lettering */
function burst(cx: number, cy: number, spikes: number, r1: number, r2: number) {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? r1 * (0.86 + ((i * 31) % 28) / 100) : r2 * (0.82 + ((i * 17) % 30) / 100);
    pts.push(`${(cx + Math.cos(a) * r * 1.5).toFixed(0)},${(cy + Math.sin(a) * r).toFixed(0)}`);
  }
  return pts.join(" ");
}

export default function RaptorPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="mangaPage">
      <svg className="mangaArt" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <pattern id="benday" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.25" fill={C.rose} opacity="0.5" />
            <circle cx="4.5" cy="4.5" r="1.25" fill={C.rose} opacity="0.5" />
          </pattern>
          <pattern id="bendayFine" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill={C.roseDeep} opacity="0.45" />
            <circle cx="3" cy="3" r="0.8" fill={C.roseDeep} opacity="0.45" />
          </pattern>
          <radialGradient id="pageGlow" cx="0.42" cy="0.36" r="0.75">
            <stop offset="0" stopColor={C.paperHi} />
            <stop offset="0.68" stopColor={C.paper} />
            <stop offset="1" stopColor="#e2d2ba" />
          </radialGradient>
        </defs>

        {/* the stock */}
        <rect x="0" y="0" width="1200" height="800" fill="url(#pageGlow)" />

        {/* halftone weather in the top corners */}
        <path d="M0,0 L1200,0 L1200,150 C820,250 420,190 0,300 Z" fill="url(#benday)" opacity="0.55" />
        <path d="M0,800 L1200,800 L1200,690 C860,600 400,700 0,640 Z" fill="url(#bendayFine)" opacity="0.4" />

        {/* motion streaks along the dive */}
        <g className="mStreaks" transform="rotate(-24 600 400)">
          {STREAKS.map((s, i) => (
            <line
              key={i}
              x1={-260}
              y1={s.y}
              x2={-260 + s.len}
              y2={s.y}
              stroke={C.inkSoft}
              strokeWidth={s.w}
              opacity={s.op}
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* ── the burst and the lettering ── */}
        <g className="mBang">
          <polygon points={burst(908, 632, 17, 206, 126)} fill={C.rose} stroke={C.ink} strokeWidth="5" />
          <polygon points={burst(908, 632, 17, 174, 102)} fill="none" stroke={C.paperHi} strokeWidth="3" opacity="0.75" />
          <text className="mBangText mBangShadow" x="908" y="668">BANG!</text>
          <text className="mBangText mBangFace" x="904" y="663">BANG!</text>
        </g>

        {/* ── the bird ──
            Proportions taken off a real griffon vulture braking to land,
            because four freehand attempts all got the same things wrong.
            What matters, and what I had wrong every time:
              - the wings are BROAD paddles, depth about 40% of their span,
                not daggers. The leading edge is nearly straight and the
                trailing edge is one big curve.
              - the body is a compact barrel, roughly a sixth of the span.
                Mine was a long rod, which is why it read as an insect.
              - the head is SMALL and sits low on a curved neck, tucked down
                and forward.
              - the primaries only splay into fingers in the outer third.
            Rendered as spot blacks with cream cut back out: no outlines
            anywhere on the creature. */}
        <g className="mBird" transform="translate(-118,-104) rotate(-9 520 470) scale(0.94)">
          {/* far wing: broad, slightly foreshortened, behind the body */}
          <path
            className="mMass"
            d="M486,424 C420,388 330,342 214,318 C168,308 150,322 158,344
               C170,378 214,424 274,470 C336,516 410,540 470,528
               C500,522 506,470 486,424 Z"
          />
          {/* its finger slots, outer third only */}
          <g className="mCut">
            <path d="M158,340 C186,352 214,368 240,388 L230,404 C200,382 172,362 152,350 Z" />
            <path d="M170,372 C196,390 224,410 250,428 L240,444 C210,424 182,402 162,384 Z" />
            <path d="M192,404 C216,424 244,444 268,460 L258,474 C230,456 204,434 182,414 Z" />
          </g>
          {/* one covert slash following the wing's curve */}
          <g className="mCut">
            <path d="M470,452 C400,414 322,378 232,354 L226,372 C314,398 392,434 462,472 Z" />
          </g>

          {/* tail: short and square, mostly tucked behind the body */}
          <path className="mMass" d="M596,506 C650,520 700,548 730,586 C692,600 640,592 598,566 C574,550 574,520 596,506 Z" />
          <g className="mCut">
            <path d="M614,528 C654,540 690,558 712,578 L704,588 C680,570 644,552 606,540 Z" />
          </g>

          {/* torso: a compact barrel, deep and short */}
          <path
            className="mMass"
            d="M462,430 C520,412 590,424 626,462 C660,498 650,542 606,558
               C556,576 490,564 460,528 C434,496 434,446 462,430 Z"
          />
          <g className="mCut">
            <path d="M486,452 C534,438 588,446 616,472 L604,486 C578,464 532,456 492,468 Z" />
            <path d="M472,502 C514,520 566,528 612,518 L614,532 C562,544 506,534 466,516 Z" />
          </g>

          {/* the near wing: the broad paddle that fills the right of the page */}
          <path
            className="mMass"
            d="M604,438 C688,392 800,346 926,322 C1006,306 1046,320 1042,348
               C1036,392 976,452 892,510 C800,572 692,600 630,580
               C588,566 578,486 604,438 Z"
          />
          {/* primaries: distinct fingers, outer third of the wing only */}
          <g className="mCut">
            <path d="M1040,338 C1006,352 970,372 938,396 L950,414 C986,388 1022,364 1046,352 Z" />
            <path d="M1026,382 C990,404 952,430 918,456 L930,474 C968,446 1008,418 1036,398 Z" />
            <path d="M998,428 C962,454 924,482 890,506 L902,522 C940,496 980,466 1010,444 Z" />
            <path d="M956,470 C920,496 882,520 846,540 L858,556 C896,534 936,508 968,486 Z" />
            <path d="M902,508 C866,530 828,550 790,564 L800,580 C842,564 882,542 914,522 Z" />
          </g>
          {/* two covert rows cut across the arm, following the curve */}
          <g className="mCut">
            <path d="M634,470 C716,424 818,384 928,362 L932,380 C826,404 728,442 646,490 Z" />
            <path d="M652,516 C734,478 826,442 918,418 L920,434 C834,458 748,492 668,532 Z" />
          </g>
          {/* one rose plane on the underside: the only colour on the bird */}
          <path className="mShade" d="M630,580 C692,600 800,572 892,510 C812,566 706,596 640,588 Z" />

          {/* the neck, curving down and forward off the shoulder */}
          <path className="mMass" d="M470,456 C440,478 420,510 412,546 C438,556 464,540 478,512 C490,488 488,466 470,456 Z" />

          {/* the head: small, low, tucked. hooked beak driving down. */}
          <g className="mHead">
            <path className="mMass" d="M414,528 C392,522 372,532 366,552 C360,574 374,594 398,598 C420,600 436,586 438,564 C440,542 430,530 414,528 Z" />
            {/* the beak: heavy, hooked, the sharpest thing on the page */}
            <path className="mMass" d="M370,566 C346,574 326,592 318,616 C332,616 350,608 366,598 C356,614 352,632 356,646 C372,636 386,614 392,592 Z" />
            <g className="mCut">
              <path d="M366,578 C348,586 334,598 328,612 C340,608 356,598 368,588 Z" />
            </g>
            {/* the eye: a small hard cream slit, one bead, no highlight */}
            <path className="mCut" d="M396,548 C408,544 420,546 424,554 C414,558 402,558 394,554 Z" />
            <circle cx="408" cy="551" r="4.2" fill="#1b0d0a" />
          </g>

          {/* the legs, dangling and reaching: this is the moment of arrival */}
          <g className="mLeg">
            <path className="mMass" d="M508,556 C504,596 500,632 492,664 L520,668 C532,634 536,596 536,558 Z" />
            <path className="mMass" d="M566,552 C570,590 570,624 564,654 L590,656 C598,624 598,588 592,552 Z" />
            {/* feet: toes splayed forward, talons hooked under */}
            {[
              "M492,664 C468,684 440,698 410,704 C420,720 452,716 480,700 C500,688 506,674 502,666 Z",
              "M512,668 C508,694 498,718 482,738 C500,742 518,728 530,706 C540,688 534,672 524,668 Z",
              "M520,666 C542,684 566,696 592,700 C586,716 556,714 530,700 C512,690 508,674 512,666 Z",
              "M564,654 C544,676 520,692 494,700 C504,716 534,710 558,694 C576,682 578,662 570,656 Z",
              "M584,656 C600,676 618,690 640,696 C634,712 606,708 584,694 C568,684 566,662 572,656 Z",
            ].map((d, i) => (
              <path key={i} className="mMass" d={d} />
            ))}
            <g className="mCut">
              <path d="M410,704 C396,710 386,720 384,730 C396,728 408,720 416,712 Z" />
              <path d="M482,738 C476,752 476,764 482,772 C492,762 496,748 494,740 Z" />
              <path d="M592,700 C606,706 616,716 618,726 C606,724 594,716 586,708 Z" />
              <path d="M640,696 C654,702 664,712 666,722 C654,720 642,712 634,704 Z" />
            </g>
          </g>
        </g>

        {/* ── the page furniture: ruled border, like the book ── */}
        <rect x="16" y="16" width="1168" height="768" fill="none" stroke={C.rose} strokeWidth="26" />
        <rect x="16" y="16" width="1168" height="768" fill="none" stroke={C.ink} strokeWidth="4" />
        <rect x="42" y="42" width="1116" height="716" fill="none" stroke={C.ink} strokeWidth="3" />
      </svg>

      <button className="mangaClose" onClick={onClose}>
        close the book
      </button>
    </div>
  );
}
