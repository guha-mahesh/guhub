import { useEffect, useRef, useState, useCallback } from 'react';
import { FaVolumeUp, FaVolumeMute, FaPlay, FaTimes } from 'react-icons/fa';
import './BackgroundMusic.css';

const API = import.meta.env.VITE_API_BASE ?? '';

interface Track {
  title: string;
  artist: string;
  albumArt: string | null;
  uri: string;
}

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isNowPlaying, setIsNowPlaying] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showMuteHint, setShowMuteHint] = useState(false);
  const muteHintShownRef = useRef(false);
  const nowPlayingUriRef = useRef<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasClickedRef = useRef(false);
  const queueRef = useRef<Track[]>([]);
  const queueIndexRef = useRef(0);
  const previewCacheRef = useRef<Record<string, string>>({});

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

  const showTrackToast = () => {
    setDismissed(false);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 5000);
  };

  const playIndex = useCallback(async (idx: number) => {
    const tracks = queueRef.current;
    if (!tracks.length) return;
    const i = idx % tracks.length;
    const track = tracks[i];
    queueIndexRef.current = i;

    const previewUrl = await getPreviewUrl(track.uri);
    if (!previewUrl) { playIndex(i + 1); return; }

    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = previewUrl;
    audioRef.current.volume = 0.15;
    audioRef.current.onended = () => playIndex(i + 1);
    audioRef.current.play().catch(() => {});

    setCurrentTrack(track);
    setIsNowPlaying(track.uri === nowPlayingUriRef.current);
    setIsPlaying(true);
    showTrackToast();
    // Show mute hint once on first play
    if (!muteHintShownRef.current) {
      muteHintShownRef.current = true;
      setShowMuteHint(true);
      setTimeout(() => setShowMuteHint(false), 4500);
    }
  }, []);

  // Build queue on mount, prefetch first few previews
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
      // Prefetch first 3 preview URLs in background
      unique.slice(0, 3).forEach(t => getPreviewUrl(t.uri));
      if (hasClickedRef.current) playIndex(0);
    };
    build();
  }, [playIndex]);

  // Click anywhere = play
  useEffect(() => {
    const tryPlay = async () => {
      hasClickedRef.current = true;
      setNeedsInteraction(false);
      // Re-fetch now-playing at click time so we get the current song
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

  const togglePlay = async () => {
    if (!audioRef.current && !queueRef.current.length) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current?.src) {
        await playIndex(queueIndexRef.current);
      } else {
        await audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
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
      >
        {isPlaying ? <FaVolumeUp /> : needsInteraction ? <FaPlay /> : <FaVolumeMute />}
      </button>

      {showMuteHint && (
        <div className="muteHint">
          <span className="muteHintArrow">→</span>
          <span className="muteHintText">click to mute</span>
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
