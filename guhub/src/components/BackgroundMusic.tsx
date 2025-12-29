import { useEffect, useRef, useState } from 'react';
import { FaVolumeUp, FaVolumeMute, FaPlay } from 'react-icons/fa';
import './BackgroundMusic.css';

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(true);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1; // 10% volume
    }

    // Try to play on any click
    const tryPlay = async () => {
      if (audioRef.current && needsInteraction) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setNeedsInteraction(false);
        } catch (e) {
          // Still blocked
        }
      }
    };

    document.addEventListener('click', tryPlay, { once: true });
    return () => document.removeEventListener('click', tryPlay);
  }, [needsInteraction]);

  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setNeedsInteraction(false);
        } catch (e) {
          console.log('Playback failed:', e);
        }
      }
    }
  };

  return (
    <div className="backgroundMusicControl">
      <audio
        ref={audioRef}
        src="/Faster Than Light soundtrack - Space Cruiser (Title).mp3"
        loop
      />
      <button
        onClick={togglePlay}
        className={`musicToggle ${needsInteraction ? 'pulse' : ''}`}
        title={isPlaying ? 'Pause Music' : 'Play Music'}
      >
        {isPlaying ? <FaVolumeUp /> : needsInteraction ? <FaPlay /> : <FaVolumeMute />}
      </button>
    </div>
  );
};

export default BackgroundMusic;
