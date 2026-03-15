// api/spotify/now-playing.ts
// GET /api/spotify/now-playing
// Returns the currently playing track or { isPlaying: false }.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAccessToken } from './_token.js';

const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const token = await getAccessToken();
    const r = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (r.status === 204 || r.status > 400) {
      return res.json({ isPlaying: false });
    }

    const data = await r.json();
    if (!data?.item) return res.json({ isPlaying: false });

    const track = {
      isPlaying: data.is_playing,
      title: data.item.name,
      artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
      album: data.item.album.name,
      albumArt: data.item.album.images[0]?.url ?? null,
      spotifyUrl: data.item.external_urls.spotify,
      progressMs: data.progress_ms,
      durationMs: data.item.duration_ms,
    };

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=30');
    return res.json(track);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: msg });
  }
}
