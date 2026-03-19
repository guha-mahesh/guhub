import { useState, useEffect } from 'react';
import './ArtistEditor.css';

const API = import.meta.env.VITE_API_BASE ?? '';
const ADMIN_KEY = 'Crescent1!';

interface ArtistEntry {
  name: string;
  spotifyArtistId: string;
  imageUrl?: string | null;
  pinId: string;
}

interface SearchResult {
  id: string;
  name: string;
  imageUrl: string | null;
  genres: string[];
}

export default function ArtistEditor() {
  const [artists, setArtists] = useState<ArtistEntry[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [state, setState] = useState<'idle' | 'searching' | 'adding' | 'error'>('idle');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const r = await fetch(`${API}/api/spotify/artist-pin`, { headers: { 'x-admin-key': ADMIN_KEY } });
      setArtists(await r.json());
    } catch {}
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setState('searching');
    setResults([]);
    setFeedback(null);
    try {
      const r = await fetch(`${API}/api/spotify/search?q=${encodeURIComponent(query)}&type=artist`);
      const data = await r.json();
      setResults(data.artists ?? []);
      setState('idle');
    } catch { setState('error'); setFeedback({ msg: 'search failed', ok: false }); }
  };

  const add = async (result: SearchResult) => {
    setAddingId(result.id);
    setState('adding');
    setFeedback(null);
    try {
      const r = await fetch(`${API}/api/spotify/artist-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify({ spotifyArtistId: result.id }),
      });
      const d = await r.json();
      if (r.status === 409) {
        setFeedback({ msg: 'already in collection', ok: false });
      } else if (r.status === 422) {
        setFeedback({ msg: d.error ?? 'could not find location', ok: false });
      } else if (r.ok) {
        setFeedback({ msg: `${result.name} → ${d.city}`, ok: true });
        setQuery('');
        setResults([]);
        load();
      } else {
        setFeedback({ msg: d.error ?? 'failed', ok: false });
      }
    } catch { setFeedback({ msg: 'failed', ok: false }); }
    setAddingId(null);
    setState('idle');
  };

  const remove = async (spotifyArtistId: string) => {
    await fetch(`${API}/api/spotify/artist-pin?artistId=${spotifyArtistId}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': ADMIN_KEY },
    });
    load();
  };

  return (
    <div className="artistEditor">
      <div className="artistEditorHeader">
        <span className="artistEditorTitle">musicians</span>
      </div>

      <form onSubmit={search} className="artistSearchForm">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setFeedback(null); }}
          placeholder="search artist..."
          className="artistSearchInput"
          disabled={state === 'searching' || state === 'adding'}
        />
        <button type="submit" disabled={!query.trim() || state === 'searching' || state === 'adding'}>
          {state === 'searching' ? '…' : 'search'}
        </button>
      </form>

      {feedback && (
        <p className={`artistFeedback ${feedback.ok ? 'ok' : 'err'}`}>
          {feedback.ok ? '✓' : '//'} {feedback.msg}
        </p>
      )}

      {results.length > 0 && (
        <div className="artistResults">
          {results.map(r => (
            <div key={r.id} className="artistResultRow">
              {r.imageUrl
                ? <img src={r.imageUrl} alt="" className="artistResultImg" />
                : <div className="artistResultImgPlaceholder" />}
              <div className="artistResultInfo">
                <span className="artistResultName">{r.name}</span>
                {r.genres.length > 0 && <span className="artistResultGenres">{r.genres.join(', ')}</span>}
              </div>
              <button
                className="artistResultAdd"
                onClick={() => add(r)}
                disabled={addingId === r.id || state === 'adding'}
              >
                {addingId === r.id ? '…' : '+'}
              </button>
            </div>
          ))}
        </div>
      )}

      {artists.length > 0 && (
        <div className="artistList">
          {artists.map(a => (
            <div key={a.spotifyArtistId} className="artistRow">
              {a.imageUrl
                ? <img src={a.imageUrl} alt="" className="artistFavicon" />
                : <div className="artistFaviconPlaceholder" />}
              <span className="artistRowName">{a.name}</span>
              <button className="artistDeleteBtn" onClick={() => remove(a.spotifyArtistId)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
