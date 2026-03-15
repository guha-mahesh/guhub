import { useState, useEffect, useRef } from 'react';
import './NowPlaying.css';

interface Track {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  spotifyUrl?: string;
  progressMs?: number;
  durationMs?: number;
}

const API = import.meta.env.VITE_API_BASE ?? '';

const NowPlaying = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [open, setOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNowPlaying = async () => {
    try {
      const r = await fetch(`${API}/api/spotify/now-playing`);
      if (!r.ok) return;
      const data: Track = await r.json();
      setTrack(data);
    } catch {}
  };

  useEffect(() => {
    fetchNowPlaying();
    pollRef.current = setInterval(fetchNowPlaying, 30_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  if (!track) return null;

  const pct = track.progressMs && track.durationMs
    ? Math.round((track.progressMs / track.durationMs) * 100)
    : 0;

  return (
    <div className={`nowPlayingWidget ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
      <div className="npPill">
        <span className={`npDot ${track.isPlaying ? 'playing' : 'paused'}`} />
        <span className="npLabel">
          {track.isPlaying
            ? <><span className="npTitle">{track.title}</span><span className="npSep"> — </span><span className="npArtist">{track.artist}</span></>
            : <span className="npIdle">not playing</span>
          }
        </span>
      </div>

      {open && track.isPlaying && (
        <div className="npExpanded" onClick={e => e.stopPropagation()}>
          <div className="npExpandedInner">
            {track.albumArt && (
              <img src={track.albumArt} alt={track.album} className="npAlbumArt" />
            )}
            <div className="npMeta">
              <p className="npExpandedTitle">{track.title}</p>
              <p className="npExpandedArtist">{track.artist}</p>
              <p className="npExpandedAlbum">{track.album}</p>
              <div className="npProgress">
                <div className="npProgressBar" style={{ width: `${pct}%` }} />
              </div>
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="npSpotifyLink"
              >
                open in spotify ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NowPlaying;
