import { useState, useEffect } from 'react';
import './MemoryFeed.css';

interface Memory {
  headline: string;
  narrative: string;
  date: string;
  source: string;
}

const QUERIES = [
  { label: 'engramme', query: 'Engramme demo Apple Samsung GitHub' },
  { label: 'typing', query: 'typing speed monkeytype record WPM' },
  { label: 'birding', query: 'birding bird prediction machine learning' },
  { label: 'sf life', query: 'San Francisco Mission Dolores neighborhood' },
  { label: 'belgium', query: 'Belgium EU project Policy Playground' },
  { label: 'ethics', query: 'philosophy ethics effective altruism' },
  { label: 'music', query: 'shoegaze music MBV Cocteau Twins' },
  { label: 'ios', query: 'iOS keyboard extension recall command' },
];

async function recall(query: string): Promise<Memory[]> {
  const r = await fetch('/api/recall', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const data = await r.json();
  return data.memories ?? [];
}

const MemoryFeed = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  const load = async (idx: number) => {
    setActiveIdx(idx);
    setLoading(true);
    try {
      const mems = await recall(QUERIES[idx].query);
      setMemories(mems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  return (
    <div className="memoryFeed">
      <div className="memFeedHeader">
        <p className="memFeedLabel">&gt; memory recall</p>
        <p className="memFeedSub">
          powered by{' '}
          <a href="https://engramme.com" target="_blank" rel="noopener noreferrer" className="memFeedLink">
            Engramme
          </a>
        </p>
      </div>

      <div className="memFeedSeeds">
        {QUERIES.map((q, i) => (
          <button
            key={q.query}
            className={`memFeedSeed ${activeIdx === i ? 'active' : ''}`}
            onClick={() => load(i)}
            disabled={loading}
          >
            {q.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="memFeedEmpty">...</p>
      ) : memories.length === 0 ? (
        <p className="memFeedEmpty">// no memories found</p>
      ) : (
        <div className="memCards">
          {memories.map((m, i) => (
            <div key={i} className="memCard">
              <div className="memCardTop">
                <span className="memCardSource">{m.source}</span>
                <span className="memCardDate">{m.date}</span>
              </div>
              <p className="memCardHeadline">{m.headline}</p>
              <p className="memCardNarrative">{m.narrative}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryFeed;
