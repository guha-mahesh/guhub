import { useEffect, useRef, useState, useCallback } from 'react';
import { FaVolumeUp, FaVolumeMute, FaPlay, FaTimes } from 'react-icons/fa';
import './BackgroundMusic.css';

const API = import.meta.env.VITE_API_BASE ?? '';

interface Track {
  title: string;
  artist: string;
  albumArt: string | null;
  uri: string; // spotify:track:xxx
}

const BackgroundMusic = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasClickedRef = useRef(false);
  const queueRef = useRef<Track[]>([]);
  const queueIndexRef = useRef(0);
  const controllerReadyRef = useRef(false);

  // Build queue from now-playing + recent
  useEffect(() => {
    const build = async () => {
      const tracks: Track[] = [];
      try {
        const np = await fetch(`${API}/api/spotify/now-playing`).then(r => r.json());
        if (np.isPlaying && np.uri) tracks.push({ title: np.title, artist: np.artist, albumArt: np.albumArt, uri: np.uri });
      } catch {}
      try {
        const recent = await fetch(`${API}/api/spotify/recent?limit=20`).then(r => r.json());
        for (const t of (recent.tracks ?? [])) {
          if (t.uri) tracks.push({ title: t.title, artist: t.artist, albumArt: t.albumArt, uri: t.uri });
        }
      } catch {}
      // dedupe by uri
      const seen = new Set<string>();
      const unique = tracks.filter(t => { if (seen.has(t.uri)) return false; seen.add(t.uri); return true; });
      queueRef.current = unique;
      console.log('[BGMusic] queue built:', unique.length, 'tracks');
      if (hasClickedRef.current && unique.length) startTrack(0, unique);
    };
    build();
  }, []);

  const getTrackId = (uri: string) => uri.replace('spotify:track:', '');

  const startTrack = useCallback((idx: number, tracks: Track[]) => {
    if (!tracks.length) return;
    const i = idx % tracks.length;
    const track = tracks[i];
    queueIndexRef.current = i;
    setCurrentTrack(track);
    controllerReadyRef.current = false;

    // Load embed iframe with this track
    const trackId = getTrackId(track.uri);
    const embedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&autoplay=1`;
    if (iframeRef.current) {
      iframeRef.current.src = embedUrl;
    }
    setIsPlaying(true);

    // Show toast for 5s
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 5000);
  }, []);

  // Listen for embed events (track end, ready)
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!e.origin.includes('spotify.com')) return;
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        console.log('[BGMusic] embed message:', data);
        if (data?.type === 'ready') {
          controllerReadyRef.current = true;
        }
        // When playback position hits duration, advance queue
        if (data?.type === 'player_state_changed') {
          const state = data.payload;
          if (state?.is_paused && state?.position === 0 && controllerReadyRef.current) {
            // track ended, play next
            const next = queueIndexRef.current + 1;
            startTrack(next, queueRef.current);
          }
        }
      } catch {}
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [startTrack]);

  // First click triggers playback
  useEffect(() => {
    const tryPlay = () => {
      hasClickedRef.current = true;
      setNeedsInteraction(false);
      if (queueRef.current.length) {
        startTrack(0, queueRef.current);
      } else {
        console.warn('[BGMusic] queue empty on click, will start when loaded');
      }
    };
    document.addEventListener('click', tryPlay, { once: true });
    return () => document.removeEventListener('click', tryPlay);
  }, [startTrack]);

  const togglePlay = () => {
    if (!iframeRef.current || !queueRef.current.length) return;
    if (isPlaying) {
      // pause via postMessage
      iframeRef.current.contentWindow?.postMessage({ command: 'pause' }, '*');
      setIsPlaying(false);
    } else {
      if (!currentTrack) {
        startTrack(0, queueRef.current);
      } else {
        iframeRef.current.contentWindow?.postMessage({ command: 'toggle' }, '*');
        setIsPlaying(true);
      }
    }
  };

  const dismissToast = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowToast(false);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  return (
    <div className="backgroundMusicControl">
      {/* Spotify embed — must be rendered (not display:none) for autoplay */}
      <iframe
        ref={iframeRef}
        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        title="spotify-preview"
      />

      <button
        onClick={togglePlay}
        className={`musicToggle ${needsInteraction ? 'pulse' : ''}`}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <FaVolumeUp /> : needsInteraction ? <FaPlay /> : <FaVolumeMute />}
      </button>

      {showToast && currentTrack && (
        <div className="musicToast">
          {currentTrack.albumArt && <img src={currentTrack.albumArt} alt="" className="toastArt" />}
          <div className="toastText">
            <span className="toastTitle">{currentTrack.title}</span>
            <span className="toastArtist">{currentTrack.artist}</span>
          </div>
          <button className="toastClose" onClick={dismissToast}><FaTimes /></button>
        </div>
      )}
    </div>
  );
};

export default BackgroundMusic;
