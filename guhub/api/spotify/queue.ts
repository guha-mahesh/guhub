// api/spotify/queue.ts
// POST /api/spotify/queue
// Body: { uri: string }  — a Spotify track URI e.g. spotify:track:XXXX
// Adds the track to your active device queue.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAccessToken } from './_token.js';

const QUEUE_URL = 'https://api.spotify.com/v1/me/player/queue';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { uri } = req.body ?? {};
  if (!uri || typeof uri !== 'string' || !uri.startsWith('spotify:track:')) {
    return res.status(400).json({ error: 'Body must include a valid spotify:track: URI' });
  }

  try {
    const token = await getAccessToken();
    const r = await fetch(`${QUEUE_URL}?uri=${encodeURIComponent(uri)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    // 204 = success, no body
    if (r.status === 204) return res.json({ ok: true });

    // 403 usually means no active device
    if (r.status === 403) {
      return res.status(403).json({ error: 'No active Spotify device — open Spotify first.' });
    }

    const body = await r.text();
    return res.status(r.status).json({ error: body });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: msg });
  }
}
