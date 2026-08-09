import { useState, useMemo } from 'react';
import './AlbumRing.css';

export interface Cover {
  album: string;
  artist: string;
  art: string;
  url: string;
}

// deterministic 0..1 from an index, so covers don't reshuffle on every render
const jitter = (i: number, seed: number) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export default function AlbumRing({ covers }: { covers: Cover[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const placed = useMemo(() => {
    const n = covers.length;
    const radius = Math.max(190, n * 27);
    return covers.map((c, i) => {
      const a = jitter(i, 1), b = jitter(i, 2), d = jitter(i, 3), e = jitter(i, 4);
      const size = 74 + a * 46;
      return {
        ...c,
        size,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          marginLeft: `${-size / 2}px`,
          marginTop: `${-size / 2}px`,
          transform: [
            `rotateY(${(i / n) * 360}deg)`,
            `translateZ(${radius + (b - 0.5) * 80}px)`,
            `translateY(${(d - 0.5) * 90}px)`,
            `rotateZ(${(a - 0.5) * 26}deg)`,
            `rotateX(${(e - 0.5) * 30}deg)`,
          ].join(' '),
          animationDelay: `${-(d * 18).toFixed(2)}s`,
          opacity: 0.42 + b * 0.4,
        } as React.CSSProperties,
      };
    });
  }, [covers]);

  if (covers.length === 0) return null;

  const shown = hover !== null ? covers[hover] : null;

  return (
    <div className="ringWrap">
      <div className="ringScene">
        <div className="ringInner">
          {placed.map((c, i) => (
            <a
              key={`${c.album}-${i}`}
              className={`ringCover ${hover === i ? 'lit' : ''}`}
              style={c.style}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(h => (h === i ? null : h))}
            >
              <img src={c.art} alt="" draggable={false} />
            </a>
          ))}
        </div>
      </div>

      <div className="ringCaption">
        {shown ? (
          <>
            <span className="ringCapAlbum">{shown.album}</span>
            <span className="ringCapSep"> / </span>
            <span className="ringCapArtist">{shown.artist}</span>
          </>
        ) : (
          <span className="ringCapIdle">// {covers.length} albums, deduped, most recent first</span>
        )}
      </div>
    </div>
  );
}
