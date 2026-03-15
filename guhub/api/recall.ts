import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Memory { headline: string; narrative: string; date: string; source: string; }

const MEMORIES: Record<string, Memory[]> = {
  'engramme': [
    { headline: 'Built Engramme iOS keyboard extension', narrative: 'Created an iOS keyboard extension bundled with the Engramme app. Extension supports /recall and /ask commands in any input box, letting users query their memory from anywhere on their phone.', date: '2026-02', source: 'claude_code' },
  ],
  'bioclock': [
    { headline: 'Trained biodiversity prediction model', narrative: 'Trained a machine learning model that scans satellite images and predicts local biodiversity levels. Prediction accuracy reached 85% after dataset augmentation.', date: '2025-08', source: 'stream' },
  ],
  'flightscope': [
    { headline: 'Built bird-spotting prediction model', narrative: 'Trained a bird-spotting prediction model using weather, time of day, and location features. Goal was predicting sighting probability for specific species under specific conditions.', date: '2025-07', source: 'stream' },
  ],
  'arbor': [
    { headline: 'Arbor vs linktr.ee positioning', narrative: 'Arbor differs from linktr.ee — focused purely on taste and what you like, not links associated with you. Goal is bringing the card to your links, not the other way around.', date: '2025-11', source: 'stream' },
  ],
  'houston': [
    { headline: 'Drove 150 miles around Houston thrifting', narrative: 'Went thrifting and drove 150 miles total across the Houston area in one day. Houston driving is ridiculous — the city is genuinely that spread out.', date: '2025-06', source: 'stream' },
  ],
  'san-francisco': [
    { headline: 'Planning SF co-op housing', narrative: 'Planned to Airbnb the first month in SF while figuring out longer-term housing. Talking to a few other Northeastern students about splitting a place, estimated $1600–2000/month.', date: '2025-10', source: 'stream' },
  ],
  'belgium': [
    { headline: 'Built Policy Playground in Belgium for EU', narrative: 'Went to Belgium for a project with the EU around May and June. Built Policy Playground there — regression models for forecasting financial markets paired with a policy recommender system.', date: '2025-07', source: 'stream' },
  ],
  'shoegaze': [
    { headline: 'Deep dive into Cocteau Twins lore', narrative: 'Went down a rabbit hole on "Ella Megalast Burls Forever" — looking into the Blue Bell Knoll album context and the creative process behind it. Classic Cocteau Twins spiral.', date: '2026-02', source: 'stream' },
  ],
  'typing': [
    { headline: '147 WPM at 15 seconds on Monkeytype', narrative: 'Shared a 15-second record score of 147 WPM on Monkeytype. Also ran a 2-minute competition with friends.', date: '2026-01', source: 'stream' },
  ],
  'ea': [
    { headline: 'Did math on slaughterhouse ethical justification', narrative: 'Did utilitarian math on what it would take to justify slaughterhouses. Conclusion: animals would need to be valued at 1/2.433 millionth of a human life for the numbers to work out. Framed as a reductio.', date: '2025-11', source: 'stream' },
    { headline: 'Eating meat is ethically indefensible without religion', narrative: 'Claimed eating meat is ethically indefensible for non-religious philosophers. Religious thinkers can justify it through frameworks where animals lack moral standing, but that move is unavailable to secular ethicists.', date: '2025-11', source: 'stream' },
  ],
  'birding': [
    { headline: 'Working on bird count prediction model', narrative: 'Working on a machine learning model that uses rough location and weather data to predict bird counts for a given area. Current models were weak because data quality was inconsistent.', date: '2025-07', source: 'stream' },
  ],
  'ios-app': [
    { headline: 'Built Engramme iOS keyboard extension', narrative: 'Created an iOS keyboard extension that supports /recall and /ask commands in any input field — lets you query memory from anywhere without switching apps.', date: '2026-02', source: 'claude_code' },
  ],
  'macos-app': [
    { headline: 'Menubar app: periodic screen capture + OCR', narrative: 'Built the macOS menubar app to run periodic screen captures using ScreenCaptureKit. Apple Vision OCR runs on each frame. A Jaccard similarity gate skips unchanged screens to avoid redundant API calls.', date: '2026-01', source: 'claude_code' },
    { headline: 'Global hotkey grabs highlighted text from any app', narrative: 'Registered a hotkey in the menubar app that grabs highlighted text from any app by simulating Cmd+C and restoring the original clipboard — so the user never notices the clipboard was touched.', date: '2026-01', source: 'claude_code' },
  ],
};

export const VALID_KEYS = new Set(Object.keys(MEMORIES));

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { queryKey } = req.body ?? {};
  if (!queryKey || !VALID_KEYS.has(queryKey)) return res.status(400).json({ error: 'Invalid query key' });
  res.setHeader('Cache-Control', 's-maxage=86400');
  return res.json({ memories: MEMORIES[queryKey] ?? [] });
}
