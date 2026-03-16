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
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.removeHeader('ETag');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const token = await getAccessToken();
    const r = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.status === 204 || r.status > 400) return res.json({ isPlaying: false });
    const data = await r.json();
    if (!data?.item) return res.json({ isPlaying: false });
    return res.json({
      isPlaying: data.is_playing,
      title: data.item.name,
      artist: data.item.artists.map((a: any) => a.name).join(', '),
      album: data.item.album.name,
      albumArt: data.item.album.images[0]?.url ?? null,
      spotifyUrl: data.item.external_urls.spotify,
      progressMs: data.progress_ms,
      durationMs: data.item.duration_ms,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
