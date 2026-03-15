// api/spotify/recent.ts
// GET /api/spotify/recent?limit=10
// Returns recently played tracks.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAccessToken } from './_token.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const limit = Math.min(Number(req.query.limit) || 10, 50);

  try {
    const token = await getAccessToken();
    const r = await fetch(
      `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await r.json();

    const tracks = (data.items ?? []).map((item: any) => ({
      title: item.track.name,
      artist: item.track.artists.map((a: any) => a.name).join(', '),
      album: item.track.album.name,
      albumArt: item.track.album.images[1]?.url ?? null,
      spotifyUrl: item.track.external_urls.spotify,
      playedAt: item.played_at,
      uri: item.track.uri,
    }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=60');
    return res.json({ tracks });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: msg });
  }
}
