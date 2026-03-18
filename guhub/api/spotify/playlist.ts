import type { VercelRequest, VercelResponse } from '@vercel/node';

const PLAYLIST_ID = process.env.CROWDSOURCE_PLAYLIST_ID!;

async function getToken(): Promise<string> {
  const basic = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: process.env.SPOTIFY_REFRESH_TOKEN! }),
  });
  return (await r.json()).access_token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = await getToken();

  // GET — fetch playlist tracks
  if (req.method === 'GET') {
    const r = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=50&fields=items(added_at,track(id,name,uri,external_urls,album(name,images),artists(name)))`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const d = await r.json();
    const tracks = (d.items ?? [])
      .filter((i: any) => i.track)
      .map((i: any) => ({
        id: i.track.id,
        title: i.track.name,
        artist: i.track.artists.map((a: any) => a.name).join(', '),
        album: i.track.album.name,
        albumArt: i.track.album.images?.[1]?.url ?? i.track.album.images?.[0]?.url ?? null,
        uri: i.track.uri,
        spotifyUrl: i.track.external_urls.spotify,
        addedAt: i.added_at,
      }));
    return res.json({ tracks, playlistId: PLAYLIST_ID });
  }

  // POST — add a track
  if (req.method === 'POST') {
    const { uri } = req.body;
    if (!uri) return res.status(400).json({ error: 'uri required' });

    // Check if already in playlist to avoid duplicates
    const existing = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?fields=items(track(uri))&limit=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(r => r.json());
    const uris = (existing.items ?? []).map((i: any) => i.track?.uri);
    if (uris.includes(uri)) return res.status(409).json({ error: 'already in playlist' });

    const r = await fetch(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: [uri] }),
    });
    if (r.ok) return res.json({ success: true });
    const err = await r.json();
    return res.status(r.status).json({ error: err.error?.message ?? 'failed' });
  }

  return res.status(405).end();
}
