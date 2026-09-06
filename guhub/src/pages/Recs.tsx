import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import './Recs.css';

/**
 * "try my recommendation algorithm" request page.
 *
 * Flow: connect Spotify -> pending (Guha approves) -> queued -> running -> done.
 * The approval step is real, not decorative: the Spotify app is in development
 * mode, so an account has to be allowlisted by hand before it can authorise at
 * all. The queue mirrors that rather than pretending runs start on their own.
 */

type Status = {
  user_id: string;
  display_name?: string;
  status: 'pending' | 'queued' | 'running' | 'done' | 'failed' | 'denied';
  requested_at?: string;
  stats?: {
    anchors?: number;
    cache_hits?: number;
    scraped?: number;
    elapsed_seconds?: number;
  };
  error?: string;
};

const STAGE: Record<Status['status'], { label: string; blurb: string }> = {
  pending: {
    label: 'waiting on guha',
    blurb: "I have to let you in before it runs. I'll get back to you. You can close this tab.",
  },
  queued: {
    label: 'in line',
    blurb: "You're in. It kicks off in the next 15 minutes or so.",
  },
  running: {
    label: 'reading',
    blurb:
      "Working through your library. Anyone new to it takes a while, so this can run for a few hours. You can close this tab.",
  },
  done: {
    label: 'done',
    blurb: "Finished. I've got your results.",
  },
  failed: {
    label: 'broke',
    blurb: "Something went wrong on my end. I can run it again.",
  },
  denied: {
    label: 'not this time',
    blurb: "This one didn't get picked up. Message me if you think that's wrong.",
  },
};

type QueueRow = {
  user_id: string;
  display_name?: string;
  status: string;
  requested_at?: string;
  error?: string;
  stats?: { anchors?: number; scraped?: number; elapsed_seconds?: number };
};

/** Queue management, shown only in admin mode (Cmd+Shift+. on any page). */
const AdminQueue = () => {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const call = useCallback(async (action: string, userId?: string) => {
    const r = await fetch('/api/phenovec/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'Crescent1!' },
      body: JSON.stringify({ action, user_id: userId }),
    });
    if (!r.ok) throw new Error((await r.json()).error ?? `failed (${r.status})`);
    return r.json();
  }, []);

  const refresh = useCallback(async () => {
    try {
      setRows((await call('list')).users ?? []);
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [call]);

  useEffect(() => {
    refresh();
    const t = window.setInterval(refresh, 20000);
    return () => window.clearInterval(t);
  }, [refresh]);

  const act = async (action: string, id: string) => {
    setBusy(id + action);
    try {
      if (action === 'link') {
        const out = await call('link', id);
        await navigator.clipboard.writeText(out.url).catch(() => {});
        window.open(out.url, '_blank');
      } else {
        await call(action, id);
      }
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy('');
  };

  return (
    <div className="rcAdmin">
      <p className="rcAdminLabel">[queue]</p>
      {err && <p className="rcErr">{err}</p>}
      {rows.length === 0 && !err && <p className="rcFine">nobody yet</p>}
      {rows.map(r => (
        <div className="rcAdminRow" key={r.user_id}>
          <div className="rcAdminWho">
            <b>{r.display_name || r.user_id}</b>
            <span className={`rcTag rcTag--${r.status}`}>{r.status}</span>
            {r.stats?.anchors ? (
              <span className="rcFine">
                {r.stats.anchors} artists
                {r.stats.elapsed_seconds ? `, ${Math.round(r.stats.elapsed_seconds / 60)} min` : ''}
              </span>
            ) : null}
          </div>
          {r.error && <p className="rcErr">{r.error.slice(0, 160)}</p>}
          <div className="rcAdminBtns">
            {r.status === 'pending' && (
              <button onClick={() => act('approve', r.user_id)} disabled={!!busy}>approve</button>
            )}
            {r.status === 'failed' && (
              <button onClick={() => act('retry', r.user_id)} disabled={!!busy}>retry</button>
            )}
            {r.status === 'done' && (
              <>
                <button onClick={() => act('link', r.user_id)} disabled={!!busy}>results</button>
                <button onClick={() => act('retry', r.user_id)} disabled={!!busy}>re-run</button>
              </>
            )}
            {r.status !== 'denied' && (
              <button onClick={() => act('deny', r.user_id)} disabled={!!busy}>deny</button>
            )}
            <button onClick={() => act('delete', r.user_id)} disabled={!!busy}>delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

const Recs = () => {
  const { isAdminMode } = useAdmin();
  const [params] = useSearchParams();
  const urlStatus = params.get('status');
  const userId = params.get('u');

  const [status, setStatus] = useState<Status | null>(null);
  const [reachError, setReachError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setUploadError('pick a file first');
    setBusy(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append('display_name', name);
      body.append('email', email);
      body.append('file', file);
      const r = await fetch('/api/phenovec/upload', { method: 'POST', body });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.detail ?? data?.error ?? `upload failed (${r.status})`);
      // Same landing spot as the OAuth callback, so both routes converge on
      // one polling view.
      window.location.href = `/recs?status=pending&u=${encodeURIComponent(data.user_id)}`;
    } catch (err) {
      setUploadError((err as Error).message);
      setBusy(false);
    }
  };

  const poll = useCallback(async () => {
    if (!userId) return;
    try {
      const r = await fetch(`/api/phenovec/status?u=${encodeURIComponent(userId)}`);
      if (r.status === 404) return; // not written yet, keep waiting
      if (!r.ok) throw new Error(`status ${r.status}`);
      const data: Status = await r.json();
      setStatus(data);
      setReachError(null);
      if ((data.status === 'done' || data.status === 'failed') && timer.current) {
        window.clearInterval(timer.current);
      }
    } catch (e) {
      setReachError((e as Error).message);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    poll();
    // 20s. The run takes minutes to hours, so anything faster is just noise.
    timer.current = window.setInterval(poll, 20000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [userId, poll]);

  const connected = Boolean(userId) || urlStatus === 'pending';
  const stage = status ? STAGE[status.status] : STAGE.pending;
  const stats = status?.stats;
  const inFlight = status?.status !== 'done' && status?.status !== 'failed';
  // All three are genuinely required: the file is the artists, the email is
  // where results go, the name is how Guha knows who approved.
  const ready = Boolean(file && name.trim() && email.trim());

  return (
    <div className="rc">
      <div className="rcVeil" />
      <div className="rcInner">
        {isAdminMode && <AdminQueue />}
        <p className="rcLabel">[experiment]</p>
        <h1 className="rcTitle">try my recommendation algorithm</h1>
        <p className="rcSub">
          A different approach to music recommendation, one that goes beyond the data about
          the songs themselves. Give it your library and it finds artists you don't have.
        </p>

        {urlStatus === 'denied' && (
          <p className="rcErr">you said no to the spotify permission, so there's nothing to read</p>
        )}

        {!connected ? (
          <div className="rcPanel">
            <ol className="rcSteps">
              <li>
                <b>Give me your artists.</b> Connect Spotify, or upload a library export if
                you're on Apple Music or anything else.
              </li>
              <li>
                <b>I let you in.</b> I do this by hand so it won't be instant.
              </li>
              <li>
                <b>It runs.</b> Can take a few hours depending on your library.
              </li>
              <li>
                <b>I send you what it found.</b>
              </li>
            </ol>

            <a className="rcConnect" href="/api/phenovec/auth">
              connect spotify
            </a>
            <p className="rcFine">
              Read only, and I have to add your Spotify account by hand first. Message me or
              Spotify will just refuse you.
            </p>

            <div className="rcOr"><span>or</span></div>

            <form className="rcUpload" onSubmit={onUpload}>
              <input
                className="rcField"
                name="display_name"
                placeholder="your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <input
                className="rcField"
                name="email"
                type="email"
                placeholder="what email should I send the results to"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <label className="rcFile">
                <input
                  type="file"
                  accept=".xml,.csv,.json,.txt,.plist"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                />
                <span>{file ? file.name : 'choose a library export'}</span>
              </label>
              <button className="rcConnect" type="submit" disabled={busy || !ready}>
                {busy ? 'reading it...' : 'upload instead'}
              </button>
              {!ready && !busy && (
                <p className="rcHint">add your name, an email, and a file to continue</p>
              )}
              {uploadError && <p className="rcErr">{uploadError}</p>}
              <p className="rcFine">
                Apple Music: open Music on a Mac, then File &rarr; Library &rarr; Export
                Library. Amazon: Account &rarr; Data and Privacy &rarr; request your info.
                A CSV or a plain list of names works too. No account limit on this route.
              </p>
            </form>
          </div>
        ) : (
          <div className="rcPanel">
            <div className={`rcStage rcStage--${status?.status ?? 'pending'}`}>
              <span className="rcDot" />
              <span>{stage.label}</span>
            </div>
            <p className="rcBlurb">{stage.blurb}</p>

            {status?.display_name && (
              <p className="rcWho">
                connected as <b>{status.display_name}</b>
              </p>
            )}

            {stats && (stats.anchors ?? 0) > 0 && (
              <div className="rcStats">
                <div>
                  <span className="rcNum">{stats.anchors}</span>
                  <span className="rcStatLabel">your artists</span>
                </div>
                <div>
                  <span className="rcNum">{stats.scraped ?? 0}</span>
                  <span className="rcStatLabel">new to it</span>
                </div>
              </div>
            )}

            {status?.status === 'failed' && status.error && (
              <p className="rcErr">{status.error}</p>
            )}

            {reachError && <p className="rcFine">can't reach the status check, still trying</p>}

            {inFlight && (
              <p className="rcFine">
                Checks every 20 seconds. Fine to close this, it keeps going without you.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recs;
