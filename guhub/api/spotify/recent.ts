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
  if (req.method === 'OPTIONS') return res.status(200).end();
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  try {
    const token = await getAccessToken();
    const r = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    const tracks = (data.items ?? []).map((item: any) => ({
      title: item.track.name,
      artist: item.track.artists.map((a: any) => a.name).join(', '),
      album: item.track.album.name,
      albumArt: item.track.album.images[1]?.url ?? null,
      spotifyUrl: item.track.external_urls.spotify,
      previewUrl: item.track.preview_url ?? null,
      playedAt: item.played_at,
      uri: item.track.uri,
    }));
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=60');
    return res.json({ tracks });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
