import { useState, useEffect, useRef, useMemo } from 'react';
import CoverDrum, { type Cover } from '../components/CoverDrum';
import './ListeningPage.css';

const previewCache: Record<string, string> = {};

function PreviewBtn({ uri }: { uri: string }) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const API = import.meta.env.VITE_API_BASE ?? '';

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    const id = uri.replace('spotify:track:', '');
    setLoading(true);
    try {
      if (!previewCache[id]) {
        const data = await fetch(`${API}/api/spotify/preview?id=${id}`).then(r => r.json());
        if (!data.previewUrl) { setLoading(false); return; }
        previewCache[id] = data.previewUrl;
      }
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = previewCache[id];
      audioRef.current.volume = 0.6;
      audioRef.current.onended = () => setPlaying(false);
      await audioRef.current.play();
      setPlaying(true);
    } catch {}
    setLoading(false);
  };

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  return (
    <button className={`previewBtn ${playing ? 'playing' : ''}`} onClick={toggle} title={playing ? 'stop' : 'preview'}>
      {loading ? '·' : playing ? '■' : '▶'}
    </button>
  );
}

interface TrackResult {
  id?: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  uri: string;
  spotifyUrl: string;
  previewUrl?: string | null;
  playedAt?: string;
}

type QueueState = 'idle' | 'searching' | 'results' | 'queuing' | 'success' | 'error';

const API = import.meta.env.VITE_API_BASE ?? '';

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ListeningPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TrackResult[]>([]);
  const [queueState, setQueueState] = useState<QueueState>('idle');
  const [message, setMessage] = useState('');
  const [queued, setQueued] = useState<TrackResult | null>(null);
  const [recent, setRecent] = useState<TrackResult[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [nowPlaying, setNowPlaying] = useState<TrackResult | null>(null);
  const [npLoaded, setNpLoaded] = useState(false);
  const [hovered, setHovered] = useState<Cover | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchNP = () => fetch(`${API}/api/spotify/now-playing`)
      .then(r => r.json())
      .then(d => d.isPlaying ? setNowPlaying(d) : setNowPlaying(null))
      .catch(() => {})
      .finally(() => setNpLoaded(true));
    fetchNP();
    const interval = setInterval(fetchNP, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/spotify/recent?limit=50`)
      .then(r => r.json())
      .then(d => setRecent(d.tracks ?? []))
      .catch(() => {})
      .finally(() => setRecentLoading(false));
  }, []);

  // one cover per album, in the order they were last heard
  const covers = useMemo<Cover[]>(() => {
    const seen = new Set<string>();
    const out: Cover[] = [];
    for (const t of recent) {
      const key = `${t.album}|${t.artist}`.toLowerCase();
      if (!t.albumArt || seen.has(key)) continue;
      seen.add(key);
      out.push({ album: t.album, artist: t.artist, art: t.albumArt, url: t.spotifyUrl });
    }
    return out;
  }, [recent]);

  // the queue only exists while a device is awake; nothing to push onto otherwise
  const queueOpen = nowPlaying !== null;

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setQueueState('searching');
    setResults([]);
    try {
      const r = await fetch(`${API}/api/spotify/search?q=${encodeURIComponent(query)}&_=${Date.now()}`);
      const data = await r.json();
      setResults(data.tracks ?? []);
      setQueueState('results');
    } catch {
      setQueueState('error');
      setMessage('search failed');
    }
  };

  const queue = async (track: TrackResult) => {
    setQueueState('queuing');
    try {
      const r = await fetch(`${API}/api/spotify/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: track.uri }),
      });
      if (r.ok) {
        setQueued(track);
        setQueueState('success');
        setQuery('');
        setResults([]);
      } else {
        const data = await r.json();
        setQueueState('error');
        setMessage(data.error ?? 'queue failed');
        // device went to sleep between page load and submit: close the queue
        if (r.status === 403 || r.status === 404) setNowPlaying(null);
      }
    } catch {
      setQueueState('error');
      setMessage('queue failed');
    }
  };

  const reset = () => {
    setQueueState('idle');
    setQuery('');
    setResults([]);
    setMessage('');
    setQueued(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const footLeft = hovered
    ? <><span className="footAlbum">{hovered.album}</span><span className="footSep"> / </span><span className="footArtist">{hovered.artist}</span></>
    : <span className="footIdle">// {covers.length} albums, deduped, most recent first</span>;

  return (
    <div className="lp">
      <CoverDrum covers={covers} dimmed={queueOpen} onHover={setHovered} />
      <div className="lpVeil" />

      <div className="lpHud">
        {/* ── left: state + queue ── */}
        <div className="lpMain">
          <p className="lpLabel">
            {!npLoaded ? '> checking' : queueOpen ? '> queue open' : '> queue closed'}
          </p>

          {queueOpen && nowPlaying ? (
            <>
              <div className="lpNow">
                {nowPlaying.albumArt && <img src={nowPlaying.albumArt} alt="" className="lpNowArt" />}
                <div className="lpNowText">
                  <span className="lpNowLabel"><span className="lpDot" /> on right now</span>
                  <a href={nowPlaying.spotifyUrl} target="_blank" rel="noopener noreferrer" className="lpNowTitle">
                    {nowPlaying.title}
                  </a>
                  <span className="lpNowArtist">{nowPlaying.artist}</span>
                </div>
              </div>

              {queueState === 'success' && queued ? (
                <div className="lpSuccess">
                  <div className="lpSuccessTrack">
                    {queued.albumArt && <img src={queued.albumArt} alt="" className="lpSuccessArt" />}
                    <div>
                      <p className="lpSuccessTitle">{queued.title}</p>
                      <p className="lpSuccessArtist">{queued.artist}</p>
                    </div>
                  </div>
                  <p className="lpSuccessMsg">queued ✓</p>
                  <button className="lpGhostBtn" onClick={reset}>queue another</button>
                </div>
              ) : (
                <>
                  <p className="lpSub">put something in my queue. it lands after whatever's playing.</p>
                  <form onSubmit={search} className="lpForm">
                    <span className="lpPrompt">$</span>
                    <input
                      ref={inputRef}
                      className="lpInput"
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="song, artist, or spotify link..."
                      disabled={queueState === 'searching' || queueState === 'queuing'}
                    />
                    <button
                      type="submit"
                      className="lpSubmit"
                      disabled={!query.trim() || queueState === 'searching' || queueState === 'queuing'}
                    >
                      {queueState === 'searching' ? '...' : 'search'}
                    </button>
                  </form>

                  {queueState === 'error' && <p className="lpError">{message}</p>}
                  {queueState === 'results' && results.length === 0 && (
                    <p className="lpError">// no results for "{query}"</p>
                  )}

                  {results.length > 0 && (
                    <div className="lpResults">
                      {results.map((track, i) => (
                        <div key={i} className="lpResultRow">
                          {track.albumArt && <img src={track.albumArt} alt="" className="lpResultArt" />}
                          <div className="lpResultText">
                            <span className="lpResultTitle">{track.title}</span>
                            <span className="lpResultMeta">{track.artist}, {track.album}</span>
                          </div>
                          <PreviewBtn uri={track.uri ?? ''} />
                          <button
                            className="lpQueueBtn"
                            onClick={() => queue(track)}
                            disabled={queueState === 'queuing'}
                          >
                            {queueState === 'queuing' ? '...' : '+ queue'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <h1 className="lpTitle">nothing playing</h1>
              <p className="lpSub">
                the queue needs a live device on the other end, so it opens back up when i put
                something on. until then, everything here is what's been spinning.
              </p>
              {queueState === 'error' && message && <p className="lpError">{message}</p>}
            </>
          )}
        </div>

        {/* ── right: the tracklist, out of the way until you want it ── */}
        <aside className={`lpSide ${listOpen ? 'open' : ''}`}>
          <button className="lpSideToggle" onClick={() => setListOpen(o => !o)}>
            {listOpen ? '× close' : '≡ recently played'}
          </button>
          {listOpen && (
            <div className="lpSideList">
              {recentLoading ? (
                <p className="lpEmpty">loading...</p>
              ) : recent.length === 0 ? (
                <p className="lpEmpty">// nothing yet</p>
              ) : (
                recent.slice(0, 30).map((track, i) => (
                  <div key={i} className="lpTrackRow">
                    {track.albumArt && <img src={track.albumArt} alt="" className="lpTrackArt" />}
                    <div className="lpTrackText">
                      <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer" className="lpTrackTitle">
                        {track.title}
                      </a>
                      <span className="lpTrackMeta">{track.artist}</span>
                    </div>
                    <PreviewBtn uri={track.uri} />
                    {track.playedAt && <span className="lpTrackTime">{timeAgo(track.playedAt)}</span>}
                  </div>
                ))
              )}
            </div>
          )}
        </aside>
      </div>

      <div className="lpFoot">{footLeft}</div>
    </div>
  );
}
