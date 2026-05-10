import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

// ──────────────────────────────────────────────────────────────────────
// Crenshaw — the steampunk anteater easter egg.
// Tracks which route + which corner he's currently hiding in. When the
// cursor closes in, he tucks away and relocates to a different random
// route AND a different random corner.
// ──────────────────────────────────────────────────────────────────────

// Only routes that have tabs in TabNavigation — otherwise the badge has
// nowhere to show and Crenshaw becomes unreachable.
const ROUTES = ['/', '/projects', '/about', '/log', '/listening'] as const;
type Route = typeof ROUTES[number];

export type Corner = 'BL' | 'BR' | 'TL' | 'TR';
const CORNERS: Corner[] = ['BL', 'BR', 'TL', 'TR'];

const ROUTE_KEY = 'crenshaw:route';
const CORNER_KEY = 'crenshaw:corner';

type Ctx = {
  currentRoute: Route;
  currentCorner: Corner;
  relocate: () => void;
};

const CrenshawContext = createContext<Ctx>({
  currentRoute: '/',
  currentCorner: 'BL',
  relocate: () => {},
});

export function CrenshawProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => {
    if (typeof window === 'undefined') return '/';
    const saved = window.localStorage.getItem(ROUTE_KEY);
    return (ROUTES as readonly string[]).includes(saved ?? '') ? (saved as Route) : '/';
  });
  const [corner, setCorner] = useState<Corner>(() => {
    if (typeof window === 'undefined') return 'BL';
    const saved = window.localStorage.getItem(CORNER_KEY) as Corner | null;
    return saved && CORNERS.includes(saved) ? saved : 'BL';
  });

  const relocate = useCallback(() => {
    setRoute(prev => {
      const candidates = ROUTES.filter(r => r !== prev);
      return candidates[Math.floor(Math.random() * candidates.length)];
    });
    setCorner(prev => {
      const candidates = CORNERS.filter(c => c !== prev);
      return candidates[Math.floor(Math.random() * candidates.length)];
    });
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(ROUTE_KEY, route); } catch {}
  }, [route]);
  useEffect(() => {
    try { window.localStorage.setItem(CORNER_KEY, corner); } catch {}
  }, [corner]);

  return (
    <CrenshawContext.Provider value={{ currentRoute: route, currentCorner: corner, relocate }}>
      {children}
    </CrenshawContext.Provider>
  );
}

export const useCrenshaw = () => useContext(CrenshawContext);
