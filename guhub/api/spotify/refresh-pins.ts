import type { VercelRequest, VercelResponse } from '@vercel/node';

const MB_UA = 'guha.one/1.0 (guhamaheshv@gmail.com)';
const NOM_UA = 'guha.one/1.0 (guhamaheshv@gmail.com)';
const SUPABASE_URL = 'https://lfgoungeysgkwvbjhueq.supabase.co';
const CHUNK = 8; // artists per invocation to stay under 10s Vercel timeout

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
    return city ? { city, country: match.country ?? '' } : null;
  } catch { return null; }
}

async function geocode(city: string, country: string): Promise<{ lat: number; lng: number } | null> {
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

const KNOWN_OVERRIDES: Record<string, { lat: number; lng: number; city: string } | null> = {
  'Cigarettes After Sex': { lat: 31.7619, lng: -106.4850, city: 'El Paso, TX' },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = req.headers['x-refresh-secret'];
  if (secret !== (process.env.REFRESH_SECRET ?? 'guha-refresh')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
  const offset = parseInt((req.query.offset as string) ?? '0');

  try {
    const token = await getSpotifyToken();
    const r = await fetch(
      'https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const artists: any[] = (await r.json()).items ?? [];
    const chunk = artists.slice(offset, offset + CHUNK);

    if (chunk.length === 0) {
      // Done — clean up pins no longer in top artists
      const currentIds = artists.map(a => `music-${a.id}`);
      await fetch(
        `${SUPABASE_URL}/rest/v1/artist_pins?id=not.in.(${currentIds.map(id => `"${id}"`).join(',')})`,
        { method: 'DELETE', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
      );
      return res.json({ done: true, total: artists.length });
    }

    const pins: any[] = [];
    for (const artist of chunk) {
      try {
        let loc: { lat: number; lng: number; city: string } | null = null;
        if (artist.name in KNOWN_OVERRIDES) {
          loc = KNOWN_OVERRIDES[artist.name];
        } else {
          const cityData = await mbArtistCity(artist.name);
          if (cityData) {
            const geo = await geocode(cityData.city, cityData.country);
            if (geo) loc = { ...geo, city: cityData.city };
          }
        }
        if (!loc) continue;
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

    // Upsert this chunk
    if (pins.length > 0) {
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
    }

    // Chain next chunk
    const nextOffset = offset + CHUNK;
    const proto = req.headers['x-forwarded-proto'] ?? 'https';
    const host = req.headers.host;
    fetch(`${proto}://${host}/api/spotify/refresh-pins?offset=${nextOffset}`, {
      method: 'POST',
      headers: { 'x-refresh-secret': process.env.REFRESH_SECRET ?? 'guha-refresh' },
    }).catch(() => {});

    return res.json({ processed: pins.length, offset, nextOffset });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
