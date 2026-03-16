import type { VercelRequest, VercelResponse } from '@vercel/node';

const MB_UA = 'guha.one/1.0 (guhamaheshv@gmail.com)';
const NOM_UA = 'guha.one/1.0 (guhamaheshv@gmail.com)';

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

// Look up artist on MusicBrainz, return their origin city name
async function mbArtistCity(name: string): Promise<{ city: string; country: string } | null> {
  try {
    const r = await fetch(
      `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(name)}&fmt=json&limit=3`,
      { headers: { 'User-Agent': MB_UA } }
    );
    if (!r.ok) return null;
    const d = await r.json();
    const artists: any[] = d.artists ?? [];

    // Find best match: name must closely match
    const match = artists.find(a =>
      a.name.toLowerCase() === name.toLowerCase() ||
      a.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(a.name.toLowerCase())
    ) ?? artists[0];

    if (!match) return null;

    // Prefer begin-area (origin) over area (current) — more interesting geographically
    const city = match['begin-area']?.name ?? match['area']?.name ?? null;
    const country = match.country ?? match['area']?.name ?? null;

    if (!city) return null;
    return { city, country };
  } catch { return null; }
}

// Geocode a city name to lat/lng via Nominatim (OSM), free, no key
async function geocode(city: string, country?: string | null): Promise<{ lat: number; lng: number; displayName: string } | null> {
  try {
    const q = country ? `${city}, ${country}` : city;
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { 'User-Agent': NOM_UA } }
    );
    if (!r.ok) return null;
    const d = await r.json();
    if (!d[0]) return null;
    return {
      lat: parseFloat(d[0].lat),
      lng: parseFloat(d[0].lon),
      displayName: d[0].display_name.split(',').slice(0, 2).join(',').trim(),
    };
  } catch { return null; }
}

// Run in batches to avoid rate limits
async function batch<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    results.push(...await Promise.all(items.slice(i, i + size).map(fn)));
    if (i + size < items.length) await new Promise(r => setTimeout(r, 300)); // MB rate limit: 1 req/sec
  }
  return results;
}

// Known bad Wikidata/MB location QIDs or mappings -> override
const KNOWN_OVERRIDES: Record<string, { lat: number; lng: number; city: string } | null> = {
  'Cigarettes After Sex': { lat: 31.7619, lng: -106.4850, city: 'El Paso, TX' },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const token = await getAccessToken();
    const r = await fetch(
      'https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await r.json();
    const artists: any[] = data.items ?? [];

    // Step 1: MusicBrainz lookup for each artist (batches of 3 to respect 1req/s)
    const withCities = await batch(artists, 3, async (artist) => {
      if (artist.name in KNOWN_OVERRIDES) {
        return { artist, override: KNOWN_OVERRIDES[artist.name] };
      }
      const cityData = await mbArtistCity(artist.name);
      return { artist, cityData, override: null };
    });

    // Step 2: Geocode all found cities (batches of 5)
    const withCoords = await batch(withCities, 5, async ({ artist, cityData, override }) => {
      if (override !== undefined) return { artist, loc: override };
      if (!cityData) return { artist, loc: null };
      const geo = await geocode(cityData.city, cityData.country);
      if (!geo) return { artist, loc: null };
      return {
        artist,
        loc: { lat: geo.lat, lng: geo.lng, city: cityData.city },
      };
    });

    // Step 3: Deduplicate by coords and build pins
    const seen = new Set<string>();
    const pins = withCoords
      .map(({ artist, loc }) => {
        if (!loc) return null;
        const key = `${loc.lat.toFixed(1)},${loc.lng.toFixed(1)}`;
        if (seen.has(key)) return null;
        seen.add(key);
        return {
          id: `music-${artist.id}`,
          name: loc.city,
          lat: loc.lat,
          lng: loc.lng,
          category: 'interest',
          description: artist.name,
          queryKeywords: `${artist.name} music`,
          spotifyArtistId: artist.id,
          wikiQuery: loc.city,
        };
      })
      .filter(Boolean);

    res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=3600');
    return res.json({ pins });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
