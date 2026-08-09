import { useState, useEffect, useMemo } from 'react';
import './CoverDrum.css';

export interface Cover {
  album: string;
  artist: string;
  art: string;
  url: string;
  uri?: string;
  previewUrl?: string | null;
}

// deterministic 0..1 per index, so covers hold their places across renders
const jitter = (i: number, seed: number) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const BANDS = [
  { y: 210, rScale: 1.0, min: 112, span: 66, dur: 64, dir: 'normal' },
  { y: -20, rScale: 0.76, min: 88, span: 52, dur: 91, dir: 'reverse' },
  { y: -240, rScale: 0.93, min: 74, span: 44, dur: 53, dir: 'normal' },
];

export default function CoverDrum({
  covers,
  dimmed = false,
  onHover,
}: {
  covers: Cover[];
  dimmed?: boolean;
  onHover?: (c: Cover | null) => void;
}) {
  const [vw, setVw] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth));

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const small = vw < 768;
  const scale = small ? 0.55 : 1;
  const radius = small ? Math.max(140, vw * 0.44) : Math.max(230, Math.min(vw * 0.42, 640));

  const bands = useMemo(() => {
    // deal covers round-robin so consecutive plays land on different bands
    const buckets: Cover[][] = BANDS.map(() => []);
    covers.forEach((c, i) => buckets[i % BANDS.length].push(c));

    return BANDS.map((spec, bi) => {
      const items = buckets[bi];
      const n = Math.max(items.length, 1);
      return {
        ...spec,
        items: items.map((c, i) => {
          const a = jitter(i, bi + 1), b = jitter(i, bi + 5), d = jitter(i, bi + 9), e = jitter(i, bi + 13);
          const size = (spec.min + a * spec.span) * scale;
          return {
            cover: c,
            style: {
              width: `${size}px`,
              height: `${size}px`,
              marginLeft: `${-size / 2}px`,
              marginTop: `${-size / 2}px`,
              transform: [
                `rotateY(${(i / n) * 360}deg)`,
                `translateZ(${radius * spec.rScale + (b - 0.5) * 120 * scale}px)`,
                `translateY(${(d - 0.5) * 110 * scale}px)`,
                `rotateZ(${(a - 0.5) * 24}deg)`,
                `rotateX(${(e - 0.5) * 26}deg)`,
              ].join(' '),
              animationDelay: `${-(d * 17).toFixed(2)}s`,
              opacity: 0.4 + b * 0.45,
            } as React.CSSProperties,
          };
        }),
      };
    });
  }, [covers, radius, scale]);

  if (covers.length === 0) return null;

  return (
    <div className={`drum ${dimmed ? 'dim' : ''}`}>
      <div className="drumScene">
        {bands.map((band, bi) => (
          <div key={bi} className="drumBandY" style={{ transform: `translateY(${band.y * scale}px)` }}>
            <div
              className="drumBandSpin"
              style={{ animationDuration: `${band.dur}s`, animationDirection: band.dir }}
            >
              {band.items.map((it, i) => (
                <a
                  key={`${it.cover.album}-${i}`}
                  className="drumCover"
                  style={it.style}
                  href={it.cover.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => onHover?.(it.cover)}
                  onMouseLeave={() => onHover?.(null)}
                >
                  <img src={it.cover.art} alt="" draggable={false} loading="lazy" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
