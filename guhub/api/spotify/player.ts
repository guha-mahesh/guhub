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

async function nowPlaying(res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.removeHeader('ETag');
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
      uri: data.item.uri,
      previewUrl: data.item.preview_url ?? null,
      progressMs: data.progress_ms,
      durationMs: data.item.duration_ms,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function recent(req: VercelRequest, res: VercelResponse) {
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

async function queue(req: VercelRequest, res: VercelResponse) {
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
    const body = await r.json().catch(() => ({}));
    if (r.status === 404 && body?.error?.reason === 'NO_ACTIVE_DEVICE')
      return res.status(404).json({ error: "Guha isn't listening right now" });
    if (r.status === 403)
      return res.status(403).json({ error: "Guha isn't listening right now" });
    return res.status(r.status).json({ error: body?.error?.message ?? 'queue failed' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;
  if (action === 'now-playing') return nowPlaying(res);
  if (action === 'recent') return recent(req, res);
  if (action === 'queue') return queue(req, res);
  return res.status(400).json({ error: 'Invalid action' });
}
