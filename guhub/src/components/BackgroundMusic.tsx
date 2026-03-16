import { useEffect, useRef, useState, useCallback } from 'react';
import { FaVolumeUp, FaVolumeMute, FaTimes } from 'react-icons/fa';
import './BackgroundMusic.css';

const API = import.meta.env.VITE_API_BASE ?? '';

interface Track {
  title: string;
  artist: string;
  albumArt: string | null;
  uri: string;
}

const BackgroundMusic = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [embedSrc, setEmbedSrc] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueRef = useRef<Track[]>([]);
  const queueIndexRef = useRef(0);
  const pendingPlayRef = useRef(false);

  const getTrackId = (uri: string) => uri.replace('spotify:track:', '');

  const sendCommand = useCallback((command: string) => {
    iframeRef.current?.contentWindow?.postMessage({ command }, 'https://open.spotify.com');
  }, []);

  const showTrackToast = useCallback(() => {
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 5000);
  }, []);

  const loadTrack = useCallback((idx: number, tracks: Track[]) => {
    if (!tracks.length) return;
    const i = idx % tracks.length;
    const track = tracks[i];
    queueIndexRef.current = i;
    setCurrentTrack(track);
    setIframeReady(false);
    pendingPlayRef.current = true;
    setEmbedSrc(`https://open.spotify.com/embed/track/${getTrackId(track.uri)}?utm_source=generator`);
    showTrackToast();
  }, [showTrackToast]);

  // Build queue on mount
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
      const seen = new Set<string>();
      const unique = tracks.filter(t => { if (seen.has(t.uri)) return false; seen.add(t.uri); return true; });
      queueRef.current = unique;
      // Preload first track immediately so embed is ready when user first interacts
      if (unique.length) {
        const track = unique[0];
        setCurrentTrack(track);
        setEmbedSrc(`https://open.spotify.com/embed/track/${getTrackId(track.uri)}?utm_source=generator`);
      }
    };
    build();
  }, []);

  // Listen for iframe API messages
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!e.origin.includes('spotify.com')) return;
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.type === 'ready') {
          setIframeReady(true);
          // If play was requested while loading, send it now
          if (pendingPlayRef.current) {
            pendingPlayRef.current = false;
            sendCommand('toggle');
            setIsPlaying(true);
          }
        }
        if (data?.type === 'player_state_changed') {
          const state = data.payload;
          if (state?.is_paused === false) setIsPlaying(true);
          if (state?.is_paused === true && state?.position === 0 && iframeReady) {
            // track ended — advance
            const next = queueIndexRef.current + 1;
            loadTrack(next, queueRef.current);
          }
        }
      } catch {}
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [sendCommand, loadTrack, iframeReady]);

  const togglePlay = useCallback(() => {
    if (!queueRef.current.length) return;
    if (isPlaying) {
      sendCommand('toggle');
      setIsPlaying(false);
    } else {
      if (!embedSrc) {
        loadTrack(0, queueRef.current);
      } else if (iframeReady) {
        sendCommand('toggle');
        setIsPlaying(true);
        if (currentTrack) showTrackToast();
      } else {
        // iframe still loading, mark pending
        pendingPlayRef.current = true;
      }
    }
  }, [isPlaying, embedSrc, iframeReady, currentTrack, sendCommand, loadTrack, showTrackToast]);

  const dismissToast = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowToast(false);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  return (
    <div className="backgroundMusicControl">
      <iframe
        ref={iframeRef}
        src={embedSrc || undefined}
        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        title="spotify-preview"
      />

      <button
        onClick={togglePlay}
        className="musicToggle"
        title={isPlaying ? 'Pause' : 'Play music'}
      >
        {isPlaying ? <FaVolumeUp /> : <FaVolumeMute />}
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
