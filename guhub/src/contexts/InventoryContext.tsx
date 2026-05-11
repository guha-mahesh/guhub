import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

// ──────────────────────────────────────────────────────────────────────
// Inventory, items the player has picked up or traded for during the
// meta-quest. Persisted to localStorage so progress survives tab close.
// ──────────────────────────────────────────────────────────────────────

export type ItemId = 'berries' | 'honey' | 'ant';
const STORAGE_KEY = 'inventory:items';

interface InventoryCtx {
  items: ItemId[];
  has: (id: ItemId) => boolean;
  add: (id: ItemId) => void;
  remove: (id: ItemId) => void;
  clear: () => void;
}

const InventoryContext = createContext<InventoryCtx>({
  items: [],
  has: () => false,
  add: () => {},
  remove: () => {},
  clear: () => {},
});

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemId[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      // one-time migration from sessionStorage if present
      const legacy = window.sessionStorage.getItem(STORAGE_KEY);
      if (legacy !== null) {
        window.localStorage.setItem(STORAGE_KEY, legacy);
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const has = useCallback((id: ItemId) => items.includes(id), [items]);
  const add = useCallback((id: ItemId) => setItems(prev => prev.includes(id) ? prev : [...prev, id]), []);
  const remove = useCallback((id: ItemId) => setItems(prev => prev.filter(x => x !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  return (
    <InventoryContext.Provider value={{ items, has, add, remove, clear }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
