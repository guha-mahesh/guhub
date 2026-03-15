import { useState, useRef } from 'react';
import './QueuePage.css';
import NowPlaying from '../components/NowPlaying';

interface TrackResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  uri: string;
  spotifyUrl: string;
}

type QueueState = 'idle' | 'searching' | 'results' | 'queuing' | 'success' | 'error';

const API = import.meta.env.VITE_API_BASE ?? '';

const QueuePage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TrackResult[]>([]);
  const [state, setState] = useState<QueueState>('idle');
  const [message, setMessage] = useState('');
  const [queued, setQueued] = useState<TrackResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setState('searching');
    setResults([]);
    try {
      const r = await fetch(`${API}/api/spotify/search?q=${encodeURIComponent(query)}`);
      const data = await r.json();
      setResults(data.tracks ?? []);
      setState('results');
    } catch {
      setState('error');
      setMessage('search failed — api might be down');
    }
  };

  const queue = async (track: TrackResult) => {
    setState('queuing');
    try {
      const r = await fetch(`${API}/api/spotify/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: track.uri }),
      });
      if (r.ok) {
        setQueued(track);
        setState('success');
        setQuery('');
        setResults([]);
      } else {
        const data = await r.json();
        setState('error');
        setMessage(data.error ?? 'queue failed');
      }
    } catch {
      setState('error');
      setMessage('queue failed — api might be down');
    }
  };

  const reset = () => {
    setState('idle');
    setQuery('');
    setResults([]);
    setMessage('');
    setQueued(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="queuePage">
      <div className="queueContainer">

        <NowPlaying />
        <div className="queueHeader">
          <p className="queueLabel">{'>'} queue a song</p>
          <h1 className="queueTitle">add to my spotify</h1>
          <p className="queueSub">
            i'm listening. search for anything and it'll land in my queue.
          </p>
        </div>

        {state === 'success' && queued ? (
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
                  placeholder="search by song, artist, or paste a spotify link..."
                  disabled={state === 'searching' || state === 'queuing'}
                  autoFocus
                />
                <button
                  type="submit"
                  className="queueSubmit"
                  disabled={!query.trim() || state === 'searching' || state === 'queuing'}
                >
                  {state === 'searching' ? '...' : 'search'}
                </button>
              </div>
            </form>

            {state === 'error' && (
              <p className="queueError">// {message}</p>
            )}

            {state === 'results' && results.length === 0 && (
              <p className="queueError">// no results for "{query}"</p>
            )}

            {results.length > 0 && (
              <div className="queueResults">
                {results.map((track) => (
                  <div key={track.id} className="queueResultRow">
                    <div className="resultInfo">
                      {track.albumArt && (
                        <img src={track.albumArt} alt="" className="resultArt" />
                      )}
                      <div className="resultText">
                        <span className="resultTitle">{track.title}</span>
                        <span className="resultMeta">{track.artist} — {track.album}</span>
                      </div>
                    </div>
                    <button
                      className="resultQueue"
                      onClick={() => queue(track)}
                      disabled={state === 'queuing'}
                    >
                      {state === 'queuing' ? '...' : '+ queue'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default QueuePage;
