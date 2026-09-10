import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FaPlay, FaPause, FaTimes } from 'react-icons/fa';
import { useIsMobile } from '../hooks/useIsMobile';
import './BackgroundMusic.css';

const API = import.meta.env.VITE_API_BASE ?? '';

interface Track {
  title: string;
  artist: string;
  albumArt: string | null;
  uri: string;
}

// ──────────────────────────────────────────────────────────────────────
// Background music = ambient noise on the tab. We deliberately use the
// Web Audio API (AudioContext + AudioBufferSourceNode) rather than an
// <audio> element. AudioBufferSourceNode does NOT register with the
// platform Media Session, so macOS Now Playing / F8 won't pick it up.
// ──────────────────────────────────────────────────────────────────────

// Routes that own their own sound and must not be talked over. /noria has a
// synthesised water-wheel creak of its own, and two ambiences at once is just
// noise. Unmounting is a real stop, not a mute: the inner component closes its
// AudioContext on unmount.
const SILENT_ROUTES = ['/noria'];

const BackgroundMusic = () => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  // Both hooks run before any early return, so the hook order stays stable.

  // Disabled entirely on mobile: no autoplay click handler, no Web Audio
  // setup, no toast, no toggle button. Saves bandwidth + screen real estate.
  if (isMobile) return null;
  if (SILENT_ROUTES.includes(pathname)) return null;
  return <BackgroundMusicInner />;
};

const BackgroundMusicInner = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isNowPlaying, setIsNowPlaying] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showPauseHint, setShowPauseHint] = useState(false);
  const pauseHintShownRef = useRef(false);
  const nowPlayingUriRef = useRef<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasClickedRef = useRef(false);
  const queueRef = useRef<Track[]>([]);
  const queueIndexRef = useRef(0);
  const previewCacheRef = useRef<Record<string, string>>({});
  const lastToastUriRef = useRef<string | null>(null);

  // ── Web Audio plumbing ──
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const bufferCacheRef = useRef<Record<string, AudioBuffer>>({});
  const startedAtRef = useRef(0);
  const pausedOffsetRef = useRef(0);
  // intentional pause flag, so `source.onended` doesn't auto-advance when we
  // stop() it ourselves (Web Audio fires onended for stop() and natural end alike)
  const intentionalStopRef = useRef(false);
  // current track URI guard, prevents 3x-scratch from racing playIndex calls
  const currentUriRef = useRef<string | null>(null);
  const loadingUriRef = useRef<string | null>(null);

  const getTrackId = (uri: string) => uri.replace('spotify:track:', '');

  const getPreviewUrl = async (uri: string): Promise<string | null> => {
    const id = getTrackId(uri);
    if (previewCacheRef.current[id]) return previewCacheRef.current[id];
    try {
      const data = await fetch(`${API}/api/spotify/preview?id=${id}`).then(r => r.json());
      if (data.previewUrl) {
        previewCacheRef.current[id] = data.previewUrl;
        return data.previewUrl;
      }
    } catch {}
    return null;
  };

  const showTrackToast = (uri: string) => {
    if (lastToastUriRef.current === uri) return;
    lastToastUriRef.current = uri;
    if (dismissed) return;
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 3500);
  };

  const ensureCtx = () => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const gain = ctx.createGain();
      gain.gain.value = 0.15;
      gain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      gainRef.current = gain;
    }
    return audioCtxRef.current;
  };

  const stopSource = (intentional: boolean) => {
    const src = sourceRef.current;
    if (!src) return;
    intentionalStopRef.current = intentional;
    try { src.stop(); } catch {}
    try { src.disconnect(); } catch {}
    sourceRef.current = null;
  };

  const playIndex = useCallback(async (idx: number) => {
    const tracks = queueRef.current;
    if (!tracks.length) return;
    const i = ((idx % tracks.length) + tracks.length) % tracks.length;
    const track = tracks[i];

    // 3x-scratch guard: same track already playing OR already loading
    if (currentUriRef.current === track.uri && sourceRef.current) return;
    if (loadingUriRef.current === track.uri) return;
    loadingUriRef.current = track.uri;
    queueIndexRef.current = i;

    const previewUrl = await getPreviewUrl(track.uri);
    if (!previewUrl) { loadingUriRef.current = null; playIndex(i + 1); return; }

    const ctx = ensureCtx();
    if (ctx.state === 'suspended') { try { await ctx.resume(); } catch {} }

    let buffer = bufferCacheRef.current[track.uri];
    if (!buffer) {
      try {
        const resp = await fetch(previewUrl);
        const arr = await resp.arrayBuffer();
        buffer = await ctx.decodeAudioData(arr);
        bufferCacheRef.current[track.uri] = buffer;
      } catch {
        loadingUriRef.current = null;
        playIndex(i + 1);
        return;
      }
    }

    // a later call may have superseded us while we were awaiting
    if (loadingUriRef.current !== track.uri) return;

    // Swap source: detach the OLD source's onended so its end (whether
    // natural or stop-induced) can't fire any handler. Don't use
    // stopSource(true) here — that sets intentionalStopRef=true, which
    // would persist past the new source's start and short-circuit the
    // new source's natural-end auto-advance.
    const old = sourceRef.current;
    if (old) {
      try { old.onended = null; } catch {}
      try { old.stop(); } catch {}
      try { old.disconnect(); } catch {}
      sourceRef.current = null;
    }
    intentionalStopRef.current = false;
    bufferRef.current = buffer;
    pausedOffsetRef.current = 0;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainRef.current!);
    source.onended = () => {
      if (intentionalStopRef.current) {
        intentionalStopRef.current = false;
        return;
      }
      playIndex(i + 1);
    };
    source.start(0);
    sourceRef.current = source;
    startedAtRef.current = ctx.currentTime;
    currentUriRef.current = track.uri;
    loadingUriRef.current = null;

    setCurrentTrack(track);
    setIsNowPlaying(track.uri === nowPlayingUriRef.current);
    setIsPlaying(true);
    showTrackToast(track.uri);
    if (!pauseHintShownRef.current) {
      pauseHintShownRef.current = true;
      setShowPauseHint(true);
      setTimeout(() => setShowPauseHint(false), 4500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const build = async () => {
      const tracks: Track[] = [];
      try {
        const np = await fetch(`${API}/api/spotify/now-playing`).then(r => r.json());
        if (np.isPlaying && np.uri) { tracks.push({ title: np.title, artist: np.artist, albumArt: np.albumArt, uri: np.uri }); nowPlayingUriRef.current = np.uri; }
      } catch {}
      try {
        const recent = await fetch(`${API}/api/spotify/recent?limit=20`).then(r => r.json());
        for (const t of (recent.tracks ?? [])) {
          if (t.uri) tracks.push({ title: t.title, artist: t.artist, albumArt: t.albumArt, uri: t.uri });
        }
      } catch {}
      const seen = new Set<string>();
      const unique = tracks.filter(t => { if (seen.has(t.uri)) return false; seen.add(t.uri); return true; });
      queueRef.current = unique;
      unique.slice(0, 3).forEach(t => getPreviewUrl(t.uri));
      // First-play is driven by the click handler, not by build completion.
    };
    build();
  }, []);

  // Click anywhere = first-play. The click handler is the single source
  // of truth for first-play; we do not re-trigger from the build effect.
  // sessionStorage 'music:paused' = '1' means the user explicitly paused
  // before refreshing — honor that and don't auto-start on first click.
  useEffect(() => {
    const tryPlay = async () => {
      if (hasClickedRef.current) return;
      hasClickedRef.current = true;
      setNeedsInteraction(false);
      try {
        if (window.sessionStorage.getItem('music:paused') === '1') return;
      } catch {}
      try {
        const np = await fetch(`${API}/api/spotify/now-playing`).then(r => r.json());
        if (np.isPlaying && np.uri) {
          nowPlayingUriRef.current = np.uri;
          const freshTrack: Track = { title: np.title, artist: np.artist, albumArt: np.albumArt, uri: np.uri };
          const queue = queueRef.current;
          if (!queue.length || queue[0].uri !== freshTrack.uri) {
            const seen = new Set([freshTrack.uri]);
            const deduped = [freshTrack, ...queue.filter(t => { if (seen.has(t.uri)) return false; seen.add(t.uri); return true; })];
            queueRef.current = deduped;
          }
        }
      } catch {}
      if (queueRef.current.length) playIndex(0);
    };
    document.addEventListener('click', tryPlay, { once: true });
    return () => document.removeEventListener('click', tryPlay);
  }, [playIndex]);

  // Tear down the audio context on unmount.
  useEffect(() => {
    return () => {
      stopSource(true);
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state !== 'closed') { try { ctx.close(); } catch {} }
      audioCtxRef.current = null;
      gainRef.current = null;
    };
  }, []);

  const togglePlay = async () => {
    if (!queueRef.current.length) return;
    if (isPlaying) {
      // pause: stop the source, capture elapsed offset so we can resume later
      const ctx = audioCtxRef.current;
      if (ctx && sourceRef.current) {
        pausedOffsetRef.current += ctx.currentTime - startedAtRef.current;
      }
      stopSource(true);
      setIsPlaying(false);
      // persist pause across refreshes within the tab
      try { window.sessionStorage.setItem('music:paused', '1'); } catch {}
    } else {
      // resume from saved offset if we have a buffer, otherwise (re)start
      const ctx = audioCtxRef.current;
      const gain = gainRef.current;
      const buf = bufferRef.current;
      if (ctx && gain && buf) {
        if (ctx.state === 'suspended') { try { await ctx.resume(); } catch {} }
        const source = ctx.createBufferSource();
        source.buffer = buf;
        source.connect(gain);
        const i = queueIndexRef.current;
        source.onended = () => {
          if (intentionalStopRef.current) {
            intentionalStopRef.current = false;
            return;
          }
          playIndex(i + 1);
        };
        const off = Math.min(pausedOffsetRef.current, buf.duration - 0.01);
        source.start(0, Math.max(0, off));
        sourceRef.current = source;
        startedAtRef.current = ctx.currentTime - off;
        setIsPlaying(true);
      } else {
        await playIndex(queueIndexRef.current);
      }
      // clear the pause flag now that the user has explicitly resumed
      try { window.sessionStorage.removeItem('music:paused'); } catch {}
    }
  };

  const dismissToast = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowToast(false);
    setDismissed(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  return (
    <div className="backgroundMusicControl">
      <button
        onClick={togglePlay}
        className={`musicToggle ${needsInteraction ? 'pulse' : ''}`}
        title={isPlaying ? 'Pause' : 'Play music'}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {needsInteraction ? <FaPlay /> : (isPlaying ? <FaPause /> : <FaPlay />)}
      </button>

      {showPauseHint && (
        <div className="muteHint">
          <span className="muteHintArrow">↑</span>
          <span className="muteHintText">click to pause</span>
        </div>
      )}

      {currentTrack && isPlaying && !dismissed && (
        <div className={`musicToast ${showToast ? 'visible' : 'faded'}`}>
          <span className="toastStatus">{isNowPlaying ? '♫ now playing' : '♫ was listening'}</span>
          <div className="toastTrack">
            {currentTrack.albumArt && <img src={currentTrack.albumArt} alt="" className="toastArt" />}
            <div className="toastText">
              <span className="toastTitle">{currentTrack.title}</span>
              <span className="toastArtist">{currentTrack.artist}</span>
            </div>
          </div>
          <button className="toastClose" onClick={dismissToast} title="dismiss"><FaTimes /></button>
        </div>
      )}
    </div>
  );
};

export default BackgroundMusic;
