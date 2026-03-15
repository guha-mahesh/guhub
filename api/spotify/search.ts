// api/spotify/search.ts
// GET /api/spotify/search?q=<query>
// Returns top 5 track results for a query.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAccessToken } from './_token';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query param q' });
  }

  try {
    const token = await getAccessToken();
    const url = `https://api.spotify.com/v1/search?type=track&limit=5&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await r.json();

    const tracks = (data.tracks?.items ?? []).map((t: {
      id: string;
      name: string;
      artists: { name: string }[];
      album: { name: string; images: { url: string }[] };
      uri: string;
      external_urls: { spotify: string };
    }) => ({
      id: t.id,
      title: t.name,
      artist: t.artists.map((a) => a.name).join(', '),
      album: t.album.name,
      albumArt: t.album.images[1]?.url ?? null,
      uri: t.uri,
      spotifyUrl: t.external_urls.spotify,
    }));

    return res.json({ tracks });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: msg });
  }
}
