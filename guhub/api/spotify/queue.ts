import type { VercelRequest, VercelResponse } from '@vercel/node';

async function getAccessToken(): Promise<string> {
  const basic = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: process.env.SPOTIFY_REFRESH_TOKEN! }),
  });
  const data = await res.json();
  return data.access_token as string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { uri } = req.body ?? {};
  if (!uri || typeof uri !== 'string' || !uri.startsWith('spotify:track:'))
    return res.status(400).json({ error: 'Invalid URI' });
  try {
    const token = await getAccessToken();
    const r = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.status === 204) return res.json({ ok: true });
    if (r.status === 403) return res.status(403).json({ error: 'No active Spotify device — open Spotify first.' });
    const body = await r.text();
    return res.status(r.status).json({ error: body });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
