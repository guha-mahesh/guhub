import { useCallback, useEffect, useState } from 'react';

// ──────────────────────────────────────────────────────────────────────
// User-uploaded "fish" persisted in localStorage. Each fish is just an
// already-trimmed-and-resized data URL plus random drifter motion params
// so it travels across the aquarium like a built-in creature. Capped
// at 3 so the localStorage quota (~5 MB / origin) is never close.
// ──────────────────────────────────────────────────────────────────────

export interface UserFish {
  id: string;
  dataUrl: string;
  top: string;
  scale: number;
  opacity: number;
  duration: number;
  delay: number;
  direction: 'ltr' | 'rtl';
  bobAmp: number;
  bobDur: number;
  verticalDrift?: number;
  depthRange?: [number, number];
}

const STORAGE_KEY = 'aquarium:user-fish';
// Same-tab sync: each useUserFish() instance has its own React state.
// The browser 'storage' event only fires on OTHER tabs, so adding a
// fish in the modal wouldn't update the Aquarium living next to it.
// We dispatch a custom event after every persist so every instance
// re-reads from localStorage.
const UPDATE_EVENT = 'aquarium:user-fish:updated';
export const MAX_USER_FISH = 3;

function load(): UserFish[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserFish[]) : [];
  } catch { return []; }
}

function persist(fish: UserFish[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fish));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  } catch {}
}

function rand(min: number, max: number) { return min + Math.random() * (max - min); }

function randomMotion(): Omit<UserFish, 'id' | 'dataUrl'> {
  const direction: 'ltr' | 'rtl' = Math.random() < 0.5 ? 'ltr' : 'rtl';
  return {
    top: `${Math.floor(rand(10, 78))}%`,
    scale: rand(0.55, 0.95),
    opacity: rand(0.6, 0.92),
    duration: rand(95, 175),
    delay: -rand(0, 90),
    direction,
    bobAmp: rand(5, 14),
    bobDur: rand(7, 12),
    verticalDrift: Math.random() < 0.55 ? (Math.random() < 0.5 ? 1 : -1) * rand(4, 14) : undefined,
    depthRange: Math.random() < 0.45 ? [rand(0.7, 0.9), rand(1.1, 1.3)] : undefined,
  };
}

export function useUserFish() {
  const [fish, setFish] = useState<UserFish[]>(load);

  // sync — same-tab via custom event, cross-tab via storage event
  useEffect(() => {
    const onLocalUpdate = () => setFish(load());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setFish(load());
    };
    window.addEventListener(UPDATE_EVENT, onLocalUpdate);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(UPDATE_EVENT, onLocalUpdate);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const add = useCallback((dataUrl: string) => {
    setFish(prev => {
      if (prev.length >= MAX_USER_FISH) return prev;
      const next: UserFish = {
        id: `uf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        dataUrl,
        ...randomMotion(),
      };
      const updated = [...prev, next];
      persist(updated);
      return updated;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setFish(prev => {
      const updated = prev.filter(f => f.id !== id);
      persist(updated);
      return updated;
    });
  }, []);

  return { fish, add, remove, max: MAX_USER_FISH };
}
