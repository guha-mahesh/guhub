import { useState, useEffect, useRef, useCallback } from 'react';
import './QueuePage.css';

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

function PreviewBtn({ url }: { url: string | null | undefined }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.volume = 0.6;
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  if (!url) return null;
  return (
    <button className={`previewBtn ${playing ? 'playing' : ''}`} onClick={toggle} title={playing ? 'stop preview' : 'play 30s preview'}>
      {playing ? '■' : '▶'}
    </button>
  );
}

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
  const [nowPlaying, setNowPlaying] = useState<TrackResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchNP = () => fetch(`${API}/api/spotify/now-playing`)
      .then(r => r.json())
      .then(d => d.isPlaying ? setNowPlaying(d) : setNowPlaying(null))
      .catch(() => {});
    fetchNP();
    const interval = setInterval(fetchNP, 30_000);
    return () => clearInterval(interval);
  }, []);

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
                      <div className="resultActions">
                        <PreviewBtn url={track.previewUrl} />
                        <button
                          className="resultQueue"
                          onClick={() => queue(track)}
                          disabled={queueState === 'queuing'}
                        >
                          {queueState === 'queuing' ? '...' : '+ queue'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── right: now playing + recently played ── */}
        <div className="recentRight">
          {nowPlaying && (
            <>
              <p className="recentLabel">&gt; now playing</p>
              <div className="recentRow npNowRow">
                {nowPlaying.albumArt && <img src={nowPlaying.albumArt} alt="" className="recentArt" />}
                <div className="recentText">
                  <a href={nowPlaying.spotifyUrl} target="_blank" rel="noopener noreferrer" className="recentTitleLink">{nowPlaying.title}</a>
                  <span className="recentMeta">{nowPlaying.artist}</span>
                </div>
                <PreviewBtn url={nowPlaying.previewUrl} />
                <span className="npBarDot" />
              </div>
              <p className="recentLabel recentLabelSpaced">&gt; recently played</p>
            </>
          )}
          {!nowPlaying && <p className="recentLabel">&gt; recently played</p>}
          {recentLoading ? (
            <p className="recentEmpty">loading...</p>
          ) : recent.length === 0 ? (
            <p className="recentEmpty">// nothing yet</p>
          ) : (
            <div className="recentList">
              {recent.map((track, i) => (
                <div key={i} className="recentRow">
                  {track.albumArt && <img src={track.albumArt} alt="" className="recentArt" />}
                  <div className="recentText">
                    <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer" className="recentTitleLink">{track.title}</a>
                    <span className="recentMeta">{track.artist}</span>
                  </div>
                  <PreviewBtn url={track.previewUrl} />
                  {track.playedAt && (
                    <span className="recentTime">{timeAgo(track.playedAt)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
