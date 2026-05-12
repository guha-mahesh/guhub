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

  // Idle-hide: after 5s of no input, fade out all UI chrome (sidebar
  // toggle, ⌘K hint, music toast/button, tab nav, view_deck label, the
  // flashlight, the opt-in icon). On any movement they fade back in.
  // Implemented via two body classes:
  //   viewDeckMode  — always on while this page is mounted; defines the
  //                   opacity transitions on the targets
  //   viewDeckIdle  — added/removed by the idle timer; flips opacity to 0
  useEffect(() => {
    document.body.classList.add('viewDeckMode');
    let timer: ReturnType<typeof setTimeout> | null = null;
    const arm = () => {
      if (timer) clearTimeout(timer);
      document.body.classList.remove('viewDeckIdle');
      timer = setTimeout(() => document.body.classList.add('viewDeckIdle'), 5000);
    };
    arm();
    window.addEventListener('mousemove', arm);
    window.addEventListener('keydown', arm);
    window.addEventListener('touchstart', arm);
    return () => {
      if (timer) clearTimeout(timer);
      document.body.classList.remove('viewDeckMode', 'viewDeckIdle');
      window.removeEventListener('mousemove', arm);
      window.removeEventListener('keydown', arm);
      window.removeEventListener('touchstart', arm);
    };
  }, []);

  return (
    <div className="viewDeck">
      <span className="viewDeckLabel">{prefix}view deck</span>
      <CoralReef />
      <div ref={flashlightRef} className="viewDeckFlashlight" />
    </div>
  );
}
