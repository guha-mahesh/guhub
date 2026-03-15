import type { VercelRequest, VercelResponse } from '@vercel/node';

// Memories are pre-curated — recalled + judged at build time, hardcoded here.
// No runtime LLM calls, no relevance filtering needed.

interface Memory { headline: string; narrative: string; date: string; source: string; }

const MEMORIES: Record<string, Memory[]> = {
  'engramme': [
    { headline: 'Built Engramme iOS keyboard extension', narrative: 'Created an iOS keyboard extension bundled with the Engramme app. Extension supports /recall and /ask commands in any input box, letting users query their memory from anywhere on their phone.', date: '2026-02', source: 'claude_code' },
  ],
  'bioclock': [
    { headline: 'Trained biodiversity prediction ML model', narrative: 'Trained a machine learning model that scans satellite images and predicts local biodiversity levels. Reported prediction accuracy reached 85% after dataset augmentation.', date: '2025-08', source: 'stream' },
  ],
  'flightscope': [
    { headline: 'Built bird-spotting prediction model', narrative: 'Trained a bird-spotting prediction model using weather, time of day, and location features. Goal was predicting sighting probability for specific species at specific conditions.', date: '2025-07', source: 'stream' },
  ],
  'meticulous': [],
  'arbor': [
    { headline: 'Arbor vs linktr.ee positioning', narrative: 'Arbor differs from linktr.ee — focused purely on taste and what you like, not links associated with you. Goal is bringing the card to your links, not the other way around.', date: '2025-11', source: 'stream' },
  ],
  'houston': [
    { headline: 'Drove 150 miles around Houston thrifting', narrative: 'Went thrifting and drove 150 miles total across the Houston area in one day. Described Houston driving as ridiculous and stupid — the city is genuinely that spread out.', date: '2025-06', source: 'stream' },
  ],
  'san-francisco': [
    { headline: 'Planning SF co-op housing — Airbnb first month', narrative: 'Planned to Airbnb the first month in SF while figuring out longer-term housing. Talking to three other Northeastern students about splitting a place, estimated $1600–2000/month.', date: '2025-10', source: 'stream' },
  ],
  'northeastern': [],
  'belgium': [
    { headline: 'Built Policy Playground in Belgium for EU', narrative: 'Went to Belgium for a project with the EU around May and June. Built Policy Playground there — regression models for forecasting financial markets paired with a policy recommender system.', date: '2025-07', source: 'stream' },
  ],
  'shoegaze': [
    { headline: 'Searched meaning of Cocteau Twins song', narrative: 'Searched Google about "Ella Megalast Burls Forever" meaning — looking into the Blue Bell Knoll album context and the involvement of Elizabeth Fraser and Robin Guthrie. Classic Cocteau Twins rabbit hole.', date: '2026-02', source: 'stream' },
  ],
  'typing': [
    { headline: '147 WPM at 15 seconds on Monkeytype', narrative: 'Shared a 15-second record score of 147 WPM on Monkeytype during a chat with Aditi. Also mentioned a 2-minute competition with friends.', date: '2026-01', source: 'stream' },
  ],
  'ea': [
    { headline: 'Did math on slaughterhouse ethical justification', narrative: 'Told Ott I did math on what it would take to justify slaughterhouses under utilitarianism. Conclusion: animals would need to be valued at 1/2.433 millionth of a human life for the math to work out. Framed as a reductio.', date: '2025-11', source: 'stream' },
    { headline: 'Eating meat is ethically wrong for non-religious philosophers', narrative: 'Claimed eating meat is ethically indefensible for non-religious philosophers. Said religious thinkers can justify it since animals lack god\'s image in their framework, but that excuse isn\'t available to secular ethicists.', date: '2025-11', source: 'stream' },
  ],
  'birding': [
    { headline: 'Working on bird prediction ML model', narrative: 'Working on a machine learning model that uses rough location and weather data to predict bird counts for a given area. Said current models were weak because data quality wasn\'t great yet.', date: '2025-07', source: 'stream' },
  ],
  'ios-app': [
    { headline: 'Built Engramme iOS keyboard extension', narrative: 'Created an iOS keyboard extension bundled with the Engramme app. Supports /recall and /ask commands in any input field — lets you query memory from anywhere without switching apps.', date: '2026-02', source: 'claude_code' },
  ],
  'macos-app': [
    { headline: 'Menubar app: periodic screen capture + OCR', narrative: 'Built the macOS menubar app to run periodic screen captures using ScreenCaptureKit. Apple Vision OCR runs on each frame. A Jaccard similarity gate skips unchanged screens to avoid redundant API calls.', date: '2026-01', source: 'claude_code' },
    { headline: 'Configured hotkeys and clipboard capture', narrative: 'Registered hotkeys in the menubar app. Periodic 30s OCR timer resets on hotkey. Enabled clipboard saving — app grabs highlighted text from any app by simulating Cmd+C and restoring the original clipboard.', date: '2026-01', source: 'claude_code' },
  ],
};

export const ALLOWED_QUERY_KEYS = new Set(Object.keys(MEMORIES));

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { queryKey } = req.body ?? {};
  if (!queryKey || !ALLOWED_QUERY_KEYS.has(queryKey)) {
    return res.status(400).json({ error: 'Invalid query key' });
  }

  res.setHeader('Cache-Control', 's-maxage=86400');
  return res.json({ memories: MEMORIES[queryKey] ?? [] });
}
