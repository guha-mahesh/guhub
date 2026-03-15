import { useState, useEffect } from 'react';
import './MemoryFeed.css';

const API_KEY = 'qfXJw6okrhiUHXYs2FQCJNPB3zmziGtd';
const BASE_URL = 'https://memorymachines-gateway-prod-btf57kda.uc.gateway.dev';

interface Memory {
  headline: string;
  narrative: string;
  date: string;
  source: string;
}

const SEED_QUERIES = [
  'Engramme demo Apple Samsung GitHub',
  'typing speed monkeytype record WPM',
  'birding bird prediction machine learning',
  'San Francisco Mission Dolores neighborhood',
  'Belgium EU project Policy Playground',
  'philosophy ethics effective altruism',
  'shoegaze music MBV Cocteau Twins',
  'iOS keyboard extension recall command',
];

async function recall(query: string): Promise<Memory[]> {
  const form = new FormData();
  form.append('text', query);
  form.append('top_k', '3');
  form.append('enable_llm_proxy_filter', 'false');
  form.append('alpha', '0.5');
  const res = await fetch(`${BASE_URL}/v1/memories/recall`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY },
    body: form,
  });
  const data = await res.json();
  return (data.memories || []).map((m: any) => ({
    headline: m.content?.headline || '',
    narrative: m.content?.narrative || '',
    date: m.content?.when?.event_start_time?.slice(0, 10) || '',
    source: m.source || '',
  }));
}

const MemoryFeed = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeQuery, setActiveQuery] = useState('');

  // load a random seed on mount
  useEffect(() => {
    const seed = SEED_QUERIES[Math.floor(Math.random() * SEED_QUERIES.length)];
    setActiveQuery(seed);
    recall(seed)
      .then(mems => setMemories(mems.slice(0, 4)))
      .finally(() => setLoading(false));
  }, []);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setActiveQuery(query.trim());
    try {
      const mems = await recall(query.trim());
      setMemories(mems.slice(0, 4));
    } finally {
      setSearching(false);
    }
  };

  const pickSeed = async (q: string) => {
    setSearching(true);
    setActiveQuery(q);
    setQuery('');
    try {
      const mems = await recall(q);
      setMemories(mems.slice(0, 4));
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="memoryFeed">
      <div className="memFeedHeader">
        <p className="memFeedLabel">&gt; memory recall</p>
        <p className="memFeedSub">
          this site runs on{' '}
          <a href="https://engramme.com" target="_blank" rel="noopener noreferrer" className="memFeedLink">
            Engramme
          </a>
          {' '}— search anything to pull memories
        </p>
      </div>

      <form onSubmit={search} className="memFeedForm">
        <div className="memFeedInputRow">
          <span className="memFeedPrompt">recall</span>
          <input
            className="memFeedInput"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="search my memory..."
            disabled={searching}
          />
          <button type="submit" className="memFeedSubmit" disabled={!query.trim() || searching}>
            {searching ? '...' : '→'}
          </button>
        </div>
      </form>

      <div className="memFeedSeeds">
        {SEED_QUERIES.slice(0, 5).map(q => (
          <button
            key={q}
            className={`memFeedSeed ${activeQuery === q ? 'active' : ''}`}
            onClick={() => pickSeed(q)}
            disabled={searching}
          >
            {q}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="memFeedEmpty">loading...</p>
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
