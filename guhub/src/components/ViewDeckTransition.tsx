import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ──────────────────────────────────────────────────────────────────────
// Curtain-into-view-deck transition. Listens for the global
// 'viewdeck:enter' event (dispatched by Aquarium when a drifter is
// clicked). Drops a CSS class on <body> that fades + translates the
// non-aquarium chrome downward, navigates mid-fall, then removes the
// class so the chrome fades back in over the new (mostly empty)
// view_deck page.
// ──────────────────────────────────────────────────────────────────────

const FALL_MS = 520;   // chrome falling out
const HOLD_MS = 220;   // brief moment of pure aquarium

export default function ViewDeckTransition() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onEnter = () => {
      if (location.pathname === '/view_deck') return;
      document.body.classList.add('viewDeckTransitioning');
      const navAt = setTimeout(() => navigate('/view_deck'), FALL_MS);
      const liftAt = setTimeout(
        () => document.body.classList.remove('viewDeckTransitioning'),
        FALL_MS + HOLD_MS,
      );
      // store ids on the body so they can be cleared if a second event
      // fires before the first completes (rare but possible)
      return () => { clearTimeout(navAt); clearTimeout(liftAt); };
    };
    window.addEventListener('viewdeck:enter', onEnter);
    return () => window.removeEventListener('viewdeck:enter', onEnter);
  }, [location.pathname, navigate]);

  return null;
}
