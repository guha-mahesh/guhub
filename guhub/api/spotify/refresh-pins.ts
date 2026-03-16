// api/spotify/refresh-pins.ts
// Called async (fire-and-forget) from top-artists.ts when cache is stale.
// Does the slow MusicBrainz + Nominatim work and writes to Supabase.
// Also callable manually: POST /api/spotify/refresh-pins

import type { VercelRequest, VercelResponse } from '@vercel/node';

const MB_UA = 'guha.one/1.0 (guhamaheshv@gmail.com)';
const NOM_UA = 'guha.one/1.0 (guhamaheshv@gmail.com)';
const SUPABASE_URL = 'https://lfgoungeysgkwvbjhueq.supabase.co';

async function getSpotifyToken(): Promise<string> {
  const basic = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: process.env.SPOTIFY_REFRESH_TOKEN! }),
  });
  return (await r.json()).access_token;
}

async function mbArtistCity(name: string): Promise<{ city: string; country: string } | null> {
  try {
    const r = await fetch(
      `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(name)}&fmt=json&limit=3`,
      { headers: { 'User-Agent': MB_UA } }
    );
    if (!r.ok) return null;
    const d = await r.json();
    const artists: any[] = d.artists ?? [];
    const match = artists.find(a =>
      a.name.toLowerCase() === name.toLowerCase() ||
      a.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(a.name.toLowerCase())
    ) ?? artists[0];
    if (!match) return null;
    const city = match['begin-area']?.name ?? match['area']?.name ?? null;
    const country = match.country ?? null;
    if (!city) return null;
    return { city, country };
  } catch { return null; }
}

async function geocode(city: string, country?: string | null): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = country ? `${city}, ${country}` : city;
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { 'User-Agent': NOM_UA } }
    );
    if (!r.ok) return null;
    const d = await r.json();
    if (!d[0]) return null;
    return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
  } catch { return null; }
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

const KNOWN_OVERRIDES: Record<string, { lat: number; lng: number; city: string } | null> = {
  'Cigarettes After Sex': { lat: 31.7619, lng: -106.4850, city: 'El Paso, TX' },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic secret check
  const secret = req.headers['x-refresh-secret'];
  if (secret !== (process.env.REFRESH_SECRET ?? 'guha-refresh')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Respond immediately — work happens after
  res.status(202).json({ message: 'Refresh started' });

  try {
    const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
    const token = await getSpotifyToken();

    const r = await fetch(
      'https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await r.json();
    const artists: any[] = data.items ?? [];

    const pins: any[] = [];
    const seenCoords = new Set<string>();
    const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

    // Process sequentially with small delays to respect rate limits
    for (const artist of artists) {
      try {
        let loc: { lat: number; lng: number; city: string } | null = null;

        if (artist.name in KNOWN_OVERRIDES) {
          loc = KNOWN_OVERRIDES[artist.name];
        } else {
          const cityData = await mbArtistCity(artist.name);
          await sleep(100); // ~10 req/s to MB

          if (cityData) {
            const cacheKey = `${cityData.city}|${cityData.country}`;
            if (!geocodeCache.has(cacheKey)) {
              const geo = await geocode(cityData.city, cityData.country);
              geocodeCache.set(cacheKey, geo);
              await sleep(1100); // Nominatim: max 1 req/s
            }
            const geo = geocodeCache.get(cacheKey);
            if (geo) loc = { ...geo, city: cityData.city };
          }
        }

        if (!loc) continue;
        const key = `${loc.lat.toFixed(1)},${loc.lng.toFixed(1)}`;
        if (seenCoords.has(key)) continue;
        seenCoords.add(key);

        pins.push({
          id: `music-${artist.id}`,
          name: loc.city,
          lat: loc.lat,
          lng: loc.lng,
          description: artist.name,
          query_keywords: `${artist.name} music`,
          spotify_artist_id: artist.id,
          wiki_query: loc.city,
          updated_at: new Date().toISOString(),
        });
      } catch { continue; }
    }

    if (!pins.length) return;

    // Upsert all pins into Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/artist_pins`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(pins),
    });

    // Remove any pins no longer in top artists
    const currentIds = pins.map(p => p.id);
    await fetch(`${SUPABASE_URL}/rest/v1/artist_pins?id=not.in.(${currentIds.map(id => `"${id}"`).join(',')})`, {
      method: 'DELETE',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
  } catch (e) {
    console.error('refresh-pins error:', e);
  }
}
