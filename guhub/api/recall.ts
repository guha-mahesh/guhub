import type { VercelRequest, VercelResponse } from '@vercel/node';

const ENGRAMME_KEY = 'qfXJw6okrhiUHXYs2FQCJNPB3zmziGtd';
const ENGRAMME_URL = 'https://memorymachines-gateway-prod-btf57kda.uc.gateway.dev';

export const ALLOWED_QUERIES: Record<string, { query: string; label: string }> = {
  'engramme':          { query: 'Engramme demo Apple Samsung GitHub product chrome extension menubar', label: 'Engramme' },
  'bioclock':          { query: 'BioClock satellite biodiversity CNN model accuracy', label: 'BioClock' },
  'flightscope':       { query: 'FlightScope birdwatching bird species Poisson prediction', label: 'FlightScope' },
  'earthborn':         { query: 'earthborn AI tells detector iMessage corpus linguistic', label: 'earthborn' },
  'experiencevec':     { query: 'ExperienceVec sensorimotor word embedding phonology Lancaster', label: 'ExperienceVec' },
  'meticulous':        { query: 'Meticulous Ableton Live DAW OSC natural language', label: 'Meticulous' },
  'monkroyer':         { query: 'Monkroyer social bingo game league friends', label: 'Monkroyer' },
  'arbor':             { query: 'Arbor cultural identity network embed profile', label: 'Arbor' },
  'houston':           { query: 'Houston home family Texas grew up', label: 'Houston' },
  'san-francisco':     { query: 'San Francisco Mission Dolores current life co-op neighborhood', label: 'San Francisco' },
  'northeastern':      { query: 'Northeastern Boston university campus honors GPA', label: 'Northeastern' },
  'belgium':           { query: 'Belgium EU project Policy Playground Brussels', label: 'Belgium' },
  'shoegaze':          { query: 'shoegaze music MBV Cocteau Twins dream pop listening', label: 'shoegaze' },
  'typing':            { query: 'typing speed monkeytype WPM record competitive', label: 'typing' },
  'entity-resolution': { query: 'entity resolution email embeddings KNN classification', label: 'entity resolution' },
  'ios-app':           { query: 'iOS keyboard extension recall command Engramme iPhone', label: 'iOS app' },
  'macos-app':         { query: 'macOS menubar app ScreenCaptureKit OCR Swift periodic', label: 'macOS app' },
  'ea':                { query: 'effective altruism ethics philosophy Singer animal', label: 'effective altruism' },
  'birding':           { query: 'birding bird prediction machine learning birdwatching species', label: 'birding' },
  'chicago':           { query: 'Chicago city visit favorite midwest', label: 'Chicago' },
  'petra':             { query: 'Petra Jordan Middle East travel visit', label: 'Petra' },
  'seoul':             { query: 'Seoul South Korea Parannoul shoegaze music', label: 'Seoul' },
};

async function isRelevant(term: string, headline: string, narrative: string): Promise<boolean> {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: `Hover term: "${term}"\nMemory headline: "${headline}"\nMemory: "${narrative.slice(0, 300)}"\n\nIs this memory genuinely about or directly related to the hover term? Reply YES or NO only.`,
        }],
      }),
    });
    const data = await r.json();
    const answer = data.content?.[0]?.text?.trim().toUpperCase() ?? 'NO';
    return answer.startsWith('YES');
  } catch {
    return false;
  }
}

function isSafe(narrative: string): boolean {
  const lower = narrative.toLowerCase();
  return !['password', 'ssn', 'credit card', 'salary', 'nadia', 'aditi',
    'girlfriend', 'date', 'relationship', 'medical', 'rejected', 'breakup'].some(s => lower.includes(s));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { queryKey } = req.body ?? {};
  const entry = ALLOWED_QUERIES[queryKey];
  if (!entry) return res.status(400).json({ error: 'Invalid query key' });

  const form = new FormData();
  form.append('text', entry.query);
  form.append('top_k', '8');
  form.append('enable_llm_proxy_filter', 'false');
  form.append('alpha', '0.5');

  try {
    const r = await fetch(`${ENGRAMME_URL}/v1/memories/recall`, {
      method: 'POST',
      headers: { 'x-api-key': ENGRAMME_KEY },
      body: form,
    });
    const data = await r.json();
    const candidates = (data.memories || [])
      .filter((m: any) => isSafe(m.content?.narrative || '') && (m.content?.narrative || '').length > 80)
      .slice(0, 6);

    // cross-reference each candidate against the term via Claude
    const checked = await Promise.all(
      candidates.map(async (m: any) => {
        const relevant = await isRelevant(entry.label, m.content?.headline || '', m.content?.narrative || '');
        return relevant ? m : null;
      })
    );

    const memories = checked
      .filter(Boolean)
      .slice(0, 2)
      .map((m: any) => ({
        headline: m.content?.headline || '',
        narrative: m.content?.narrative || '',
        date: m.content?.when?.event_start_time?.slice(0, 10) || '',
        source: m.source || '',
      }));

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=120');
    return res.json({ memories });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
