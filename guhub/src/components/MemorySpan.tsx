import { useState, useRef, useCallback } from 'react';
import { MEMORY_SPAN_KEYS } from './memoryKeys';
import './MemorySpan.css';

interface Memory {
  headline: string;
  narrative: string;
  date: string;
  source: string;
}

interface Props {
  queryKey: string;
  children: React.ReactNode;
}

const cache = new Map<string, Memory[]>();

export default function MemorySpan({ queryKey, children }: Props) {
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<'above' | 'below'>('above');
  // apply styling immediately if we know this key has content
  const hasKnownContent = MEMORY_SPAN_KEYS.has(queryKey);
  const spanRef = useRef<HTMLSpanElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (cache.has(queryKey)) {
      setMemories(cache.get(queryKey)!);
      return;
    }
    setLoading(true);
    try {
      const r = await fetch('/api/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryKey }),
      });
      const data = await r.json();
      const mems: Memory[] = data.memories ?? [];
      cache.set(queryKey, mems);
      setMemories(mems);
    } catch {
      setMemories([]);
    } finally {
      setLoading(false);
    }
  }, [queryKey]);

  const onMouseEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    // decide card position based on viewport
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      setPos(rect.top > 160 ? 'above' : 'below');
    }
    setVisible(true);
    if (!cache.has(queryKey)) load();
    else setMemories(cache.get(queryKey)!);
  };

  const onMouseLeave = () => {
    hideTimer.current = setTimeout(() => setVisible(false), 180);
  };

  const hasContent = memories && memories.length > 0;

  return (
    <span
      ref={spanRef}
      className={`memSpan ${hasKnownContent ? 'memSpanActive' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      {visible && hasContent && (
        <span
          className={`memSpanCard ${pos}`}
          onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); }}
          onMouseLeave={onMouseLeave}
        >
          <span className="memSpanCardHeader">
            <span className="memSpanCardHeaderDot" />
            <span className="memSpanCardHeaderLabel">memory</span>
            <span className="memSpanCardHeaderBrand">engramme</span>
          </span>
          <span className="memSpanCardBody">
            {loading && <span className="memSpanLoading">...</span>}
            {!loading && memories.map((m, i) => (
              <span key={i} className="memSpanMemory">
                <span className="memSpanMeta">
                  <span className="memSpanSource">{m.source}</span>
                  <span className="memSpanDate">{m.date}</span>
                </span>
                <span className="memSpanHeadline">{m.headline}</span>
                <span className="memSpanNarrative">{m.narrative}</span>
                {i < memories.length - 1 && <span className="memSpanDivider" />}
              </span>
            ))}
          </span>
        </span>
      )}
    </span>
  );
}
