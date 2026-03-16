import { useEffect, useRef, useState, useCallback } from 'react';
import { FaVolumeUp, FaVolumeMute, FaPlay, FaTimes } from 'react-icons/fa';
import './BackgroundMusic.css';

const API = import.meta.env.VITE_API_BASE ?? '';

interface Track {
  title: string;
  artist: string;
  albumArt: string | null;
  previewUrl: string | null;
}

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(true);
  const [queueIndex, setQueueIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasClickedRef = useRef(false);
  const queueRef = useRef<Track[]>([]);

  // Build preview queue from now-playing + recent
  useEffect(() => {
    const build = async () => {
      const tracks: Track[] = [];
      try {
        const np = await fetch(`${API}/api/spotify/now-playing`).then(r => r.json());
        console.log('[BGMusic] now-playing:', np);
        if (np.isPlaying && np.previewUrl) tracks.push({ title: np.title, artist: np.artist, albumArt: np.albumArt, previewUrl: np.previewUrl });
        else console.log('[BGMusic] now-playing skipped: isPlaying=', np.isPlaying, 'previewUrl=', np.previewUrl);
      } catch(e) { console.error('[BGMusic] now-playing fetch error:', e); }
      try {
        const recent = await fetch(`${API}/api/spotify/recent?limit=20`).then(r => r.json());
        console.log('[BGMusic] recent tracks:', recent.tracks?.length, 'with previews:', recent.tracks?.filter((t: any) => t.previewUrl).length);
        for (const t of (recent.tracks ?? [])) {
          if (t.previewUrl) tracks.push({ title: t.title, artist: t.artist, albumArt: t.albumArt, previewUrl: t.previewUrl });
        }
      } catch(e) { console.error('[BGMusic] recent fetch error:', e); }
      console.log('[BGMusic] queue built, total tracks with previews:', tracks.length);
      queueRef.current = tracks;
      if (hasClickedRef.current && tracks.length) {
        console.log('[BGMusic] user already clicked, starting playback');
        playIndex(0, tracks);
      }
    };
    build();
  }, []);

  const playIndex = useCallback((idx: number, tracks: Track[]) => {
    console.log('[BGMusic] playIndex called, idx=', idx, 'tracks=', tracks.length);
    if (!tracks.length) { console.warn('[BGMusic] playIndex: no tracks'); return; }
    const i = idx % tracks.length;
    const track = tracks[i];
    console.log('[BGMusic] playing:', track.title, 'previewUrl=', track.previewUrl);
    if (!track.previewUrl) { playIndex(i + 1, tracks); return; }

    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = track.previewUrl;
    audioRef.current.volume = 0.1;
    audioRef.current.onended = () => {
      setQueueIndex(i + 1);
      playIndex(i + 1, tracks);
    };
    audioRef.current.play()
      .then(() => console.log('[BGMusic] play() succeeded'))
      .catch(e => console.error('[BGMusic] play() failed:', e));
    setCurrentTrack(track);
    setQueueIndex(i);
    setIsPlaying(true);

    // Show toast for 5s
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 5000);
  }, []);

  // Try to play on first click
  useEffect(() => {
    const tryPlay = () => {
      console.log('[BGMusic] first click detected, queueRef.length=', queueRef.current.length);
      hasClickedRef.current = true;
      setNeedsInteraction(false);
      if (queueRef.current.length) {
        playIndex(0, queueRef.current);
      } else {
        console.warn('[BGMusic] click fired but queue is empty — will start when queue loads');
      }
    };
    document.addEventListener('click', tryPlay, { once: true });
    return () => document.removeEventListener('click', tryPlay);
  }, [playIndex]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src && queueRef.current.length) {
        playIndex(queueIndex, queueRef.current);
      } else {
        await audioRef.current.play().catch(() => {});
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
      <button
        onClick={togglePlay}
        className={`musicToggle ${needsInteraction ? 'pulse' : ''}`}
        title={isPlaying ? 'Pause Music' : 'Play Music'}
      >
        {isPlaying ? <FaVolumeUp /> : needsInteraction ? <FaPlay /> : <FaVolumeMute />}
      </button>

      {showToast && currentTrack && (
        <div className="musicToast">
          {currentTrack.albumArt && (
            <img src={currentTrack.albumArt} alt="" className="toastArt" />
          )}
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
