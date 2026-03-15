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
  const { q } = req.query;
  if (!q || typeof q !== 'string') return res.status(400).json({ error: 'Missing q' });
  try {
    const token = await getAccessToken();
    const r = await fetch(`https://api.spotify.com/v1/search?type=track&limit=5&q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    const tracks = (data.tracks?.items ?? []).map((t: any) => ({
      id: t.id, title: t.name,
      artist: t.artists.map((a: any) => a.name).join(', '),
      album: t.album.name,
      albumArt: t.album.images[1]?.url ?? null,
      uri: t.uri,
      spotifyUrl: t.external_urls.spotify,
    }));
    return res.json({ tracks });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
