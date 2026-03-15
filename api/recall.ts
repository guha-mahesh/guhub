import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = 'qfXJw6okrhiUHXYs2FQCJNPB3zmziGtd';
const BASE_URL = 'https://memorymachines-gateway-prod-btf57kda.uc.gateway.dev';

export const ALLOWED_QUERIES: Record<string, string> = {
  'engramme':          'Engramme demo Apple Samsung GitHub product',
  'bioclock':          'BioClock satellite biodiversity CNN model',
  'flightscope':       'FlightScope birdwatching bird species prediction',
  'earthborn':         'earthborn AI tells detector iMessage corpus',
  'experiencevec':     'ExperienceVec sensorimotor word embedding phonology',
  'meticulous':        'Meticulous Ableton Live DAW natural language',
  'monkroyer':         'Monkroyer social bingo game league',
  'arbor':             'Arbor cultural identity network embeds',
  'houston':           'Houston home family Texas grew up',
  'san-francisco':     'San Francisco Mission Dolores current life co-op',
  'northeastern':      'Northeastern Boston university campus honors',
  'belgium':           'Belgium EU project Policy Playground Brussels',
  'shoegaze':          'shoegaze music MBV Cocteau Twins dream pop',
  'typing':            'typing speed monkeytype WPM record',
  'entity-resolution': 'entity resolution email embeddings KNN classification',
  'ios-app':           'iOS keyboard extension recall command Engramme',
  'macos-app':         'macOS menubar app ScreenCaptureKit OCR Swift',
  'ea':                'effective altruism ethics philosophy Singer',
  'mayfield':          'Mayfield fundraising investor raise',
  'birding':           'birding bird prediction machine learning birdwatching',
  'chicago':           'Chicago city visit favorite',
  'petra':             'Petra Jordan Middle East travel visit',
  'seoul':             'Seoul South Korea Parannoul shoegaze',
};

// Filter out sensitive content — skip anything that looks like private comms
function isSafe(narrative: string): boolean {
  const lower = narrative.toLowerCase();
  const sensitive = ['password', 'ssn', 'credit card', 'salary', 'private', 'confidential',
    'nadia', 'aditi', 'girlfriend', 'date', 'relationship', 'medical', 'health',
    'fired', 'rejected', 'breakup', 'crying', 'depressed', 'anxiety'];
  return !sensitive.some(s => lower.includes(s));
}

function isInteresting(m: any): boolean {
  const n = (m.narrative || '').toLowerCase();
  const h = (m.headline || '').toLowerCase();
  // needs some substance
  if ((m.narrative || '').length < 80) return false;
  // skip pure calendar/uber/logistics noise
  const boring = ['uber trip', 'shared a link', 'sent a message', 'google calendar',
    'tracking link', 'order placed', 'package', 'delivery'];
  if (boring.some(b => n.includes(b) || h.includes(b))) return false;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { queryKey } = req.body ?? {};
  const query = ALLOWED_QUERIES[queryKey];
  if (!query) return res.status(400).json({ error: 'Invalid query key' });

  const form = new FormData();
  form.append('text', query);
  form.append('top_k', '6');
  form.append('enable_llm_proxy_filter', 'false');
  form.append('alpha', '0.5');

  try {
    const r = await fetch(`${BASE_URL}/v1/memories/recall`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY },
      body: form,
    });
    const data = await r.json();
    const memories = (data.memories || [])
      .filter((m: any) => isSafe(m.content?.narrative || '') && isInteresting(m.content))
      .slice(0, 2)
      .map((m: any) => ({
        headline: m.content?.headline || '',
        narrative: m.content?.narrative || '',
        date: m.content?.when?.event_start_time?.slice(0, 10) || '',
        source: m.source || '',
      }));
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.json({ memories });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
