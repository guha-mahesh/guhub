import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = 'qfXJw6okrhiUHXYs2FQCJNPB3zmziGtd';
const BASE_URL = 'https://memorymachines-gateway-prod-btf57kda.uc.gateway.dev';

// only these queries are allowed — no free search
const ALLOWED_QUERIES = [
  'Engramme demo Apple Samsung GitHub',
  'typing speed monkeytype record WPM',
  'birding bird prediction machine learning',
  'San Francisco Mission Dolores neighborhood',
  'Belgium EU project Policy Playground',
  'philosophy ethics effective altruism',
  'shoegaze music MBV Cocteau Twins',
  'iOS keyboard extension recall command',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.body ?? {};
  if (!query || !ALLOWED_QUERIES.includes(query)) {
    return res.status(400).json({ error: 'Invalid query' });
  }

  const form = new FormData();
  form.append('text', query);
  form.append('top_k', '4');
  form.append('enable_llm_proxy_filter', 'false');
  form.append('alpha', '0.5');

  try {
    const r = await fetch(`${BASE_URL}/v1/memories/recall`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY },
      body: form,
    });
    const data = await r.json();
    const memories = (data.memories || []).map((m: any) => ({
      headline: m.content?.headline || '',
      narrative: m.content?.narrative || '',
      date: m.content?.when?.event_start_time?.slice(0, 10) || '',
      source: m.source || '',
    }));
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60');
    return res.json({ memories });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
