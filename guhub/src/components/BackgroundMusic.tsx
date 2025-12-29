import { useEffect, useRef, useState } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import './BackgroundMusic.css';

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1; // 10% volume

      // Try to autoplay (may be blocked by browser)
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was blocked, user needs to interact first
          console.log('Autoplay blocked - waiting for user interaction');
        });
      }
    }
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play();
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsMuted(true);
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
        onClick={toggleMute}
        className="musicToggle"
        title={isMuted ? 'Unmute Music' : 'Mute Music'}
      >
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </button>
    </div>
  );
};

export default BackgroundMusic;
