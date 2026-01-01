import { useEffect, useRef, useState } from 'react';
import { FaVolumeUp, FaVolumeMute, FaPlay } from 'react-icons/fa';
import './BackgroundMusic.css';

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(true);
  const [isPausedByOtherMedia, setIsPausedByOtherMedia] = useState(false);

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

  // Auto-pause when Spotify or other audio plays
  useEffect(() => {
    let pauseTimeout: NodeJS.Timeout;
    let resumeTimeout: NodeJS.Timeout;

    const handleMouseEnterIframe = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IFRAME' && audioRef.current && isPlaying) {
        // Pause after a short delay when user interacts with iframe
        pauseTimeout = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPausedByOtherMedia(true);
          }
        }, 500);
      }
    };

    const handleMouseLeaveIframe = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IFRAME' && audioRef.current && isPausedByOtherMedia) {
        // Resume after user leaves iframe
        clearTimeout(pauseTimeout);
        resumeTimeout = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
            setIsPausedByOtherMedia(false);
          }
        }, 1000);
      }
    };

    // Add listeners to all iframes
    const addIframeListeners = () => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        iframe.addEventListener('mouseenter', handleMouseEnterIframe);
        iframe.addEventListener('mouseleave', handleMouseLeaveIframe);
      });
    };

    // Initial setup
    addIframeListeners();

    // Re-add listeners when DOM changes (for dynamic iframes)
    const observer = new MutationObserver(addIframeListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(pauseTimeout);
      clearTimeout(resumeTimeout);
      observer.disconnect();
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        iframe.removeEventListener('mouseenter', handleMouseEnterIframe);
        iframe.removeEventListener('mouseleave', handleMouseLeaveIframe);
      });
    };
  }, [isPlaying, isPausedByOtherMedia]);

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
