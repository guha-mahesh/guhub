import { useEffect, useRef } from 'react';
import { useMeta, metaLabel } from '../contexts/MetaContext';
import CoralReef from '../components/CoralReef';
import './ViewDeck.css';

// ──────────────────────────────────────────────────────────────────────
// view_deck — an intentionally empty page that exists only as a window
// onto the global aquarium + a steampunk coral reef.
//
// The cursor acts as a flashlight: a darkening overlay covers the screen
// and a circular cutout follows the mouse, revealing the aquarium only
// within a ~18vh radius. Updated via a ref (not state) so mousemove
// doesn't trigger React renders.
// ──────────────────────────────────────────────────────────────────────

export default function ViewDeck() {
  const { level } = useMeta();
  const prefix = level > 0 ? metaLabel(level).toLowerCase() + ' ' : '';
  const flashlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start centered so the very first frame isn't all-dark.
    if (flashlightRef.current) {
      flashlightRef.current.style.setProperty('--mouse-x', `${window.innerWidth / 2}px`);
      flashlightRef.current.style.setProperty('--mouse-y', `${window.innerHeight / 2}px`);
    }
    const handler = (e: MouseEvent) => {
      const el = flashlightRef.current;
      if (!el) return;
      el.style.setProperty('--mouse-x', `${e.clientX}px`);
      el.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div className="viewDeck">
      <span className="viewDeckLabel">{prefix}view_deck</span>
      <CoralReef />
      <div ref={flashlightRef} className="viewDeckFlashlight" />
    </div>
  );
}
