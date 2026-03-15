import { useState, useEffect, useRef } from 'react';
import './QueuePage.css';
import NowPlaying from '../components/NowPlaying';

interface TrackResult {
  id?: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  uri: string;
  spotifyUrl: string;
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

export default function QueuePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TrackResult[]>([]);
  const [queueState, setQueueState] = useState<QueueState>('idle');
  const [message, setMessage] = useState('');
  const [queued, setQueued] = useState<TrackResult | null>(null);
  const [recent, setRecent] = useState<TrackResult[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API}/api/spotify/recent?limit=15`)
      .then(r => r.json())
      .then(d => setRecent(d.tracks ?? []))
      .catch(() => {})
      .finally(() => setRecentLoading(false));
  }, []);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setQueueState('searching');
    setResults([]);
    try {
      const r = await fetch(`${API}/api/spotify/search?q=${encodeURIComponent(query)}`);
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

  return (
    <div className="queuePage">
      <NowPlaying />
      <div className="queueLayout">

        {/* ── left: queue ── */}
        <div className="queueLeft">
          <div className="queueHeader">
            <p className="queueLabel">&gt; queue a song</p>
            <h1 className="queueTitle">add to my spotify</h1>
            <p className="queueSub">i'm listening. search for anything and it'll land in my queue.</p>
          </div>

          {queueState === 'success' && queued ? (
            <div className="queueSuccess">
              <div className="successTrack">
                {queued.albumArt && <img src={queued.albumArt} alt="" className="successArt" />}
                <div>
                  <p className="successTitle">{queued.title}</p>
                  <p className="successArtist">{queued.artist}</p>
                </div>
              </div>
              <p className="successMsg">queued ✓</p>
              <button className="queueAgain" onClick={reset}>queue another</button>
            </div>
          ) : (
            <>
              <form onSubmit={search} className="queueForm">
                <div className="queueInputRow">
                  <span className="queuePrompt">$</span>
                  <input
                    ref={inputRef}
                    className="queueInput"
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="song, artist, or spotify link..."
                    disabled={queueState === 'searching' || queueState === 'queuing'}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="queueSubmit"
                    disabled={!query.trim() || queueState === 'searching' || queueState === 'queuing'}
                  >
                    {queueState === 'searching' ? '...' : 'search'}
                  </button>
                </div>
              </form>

              {queueState === 'error' && <p className="queueError">// {message}</p>}
              {queueState === 'results' && results.length === 0 && (
                <p className="queueError">// no results for "{query}"</p>
              )}

              {results.length > 0 && (
                <div className="queueResults">
                  {results.map((track, i) => (
                    <div key={i} className="queueResultRow">
                      <div className="resultInfo">
                        {track.albumArt && <img src={track.albumArt} alt="" className="resultArt" />}
                        <div className="resultText">
                          <span className="resultTitle">{track.title}</span>
                          <span className="resultMeta">{track.artist} — {track.album}</span>
                        </div>
                      </div>
                      <button
                        className="resultQueue"
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
        </div>

        {/* ── right: recently played ── */}
        <div className="recentRight">
          <p className="recentLabel">&gt; recently played</p>
          {recentLoading ? (
            <p className="recentEmpty">loading...</p>
          ) : recent.length === 0 ? (
            <p className="recentEmpty">// nothing yet</p>
          ) : (
            <div className="recentList">
              {recent.map((track, i) => (
                <a
                  key={i}
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="recentRow"
                >
                  {track.albumArt && <img src={track.albumArt} alt="" className="recentArt" />}
                  <div className="recentText">
                    <span className="recentTitle">{track.title}</span>
                    <span className="recentMeta">{track.artist}</span>
                  </div>
                  {track.playedAt && (
                    <span className="recentTime">{timeAgo(track.playedAt)}</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
