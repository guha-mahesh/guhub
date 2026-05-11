import { useEffect, useState } from 'react';

// ──────────────────────────────────────────────────────────────────────
// Shared mobile detection. Matches the rule BrainLanding's mobile
// fallback uses: <=768px viewport OR a known mobile UA string. Resizes
// re-evaluate. Server-render safe (defaults to non-mobile).
// ──────────────────────────────────────────────────────────────────────

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

function compute(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || MOBILE_UA.test(navigator.userAgent);
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(compute);

  useEffect(() => {
    const onResize = () => setIsMobile(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile;
}
