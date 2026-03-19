import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = 'https://lfgoungeysgkwvbjhueq.supabase.co';
const MB_UA = 'guha.one/1.0 (guhamaheshv@gmail.com)';
const NOM_UA = 'guha.one/1.0 (guhamaheshv@gmail.com)';

const KNOWN_OVERRIDES: Record<string, { lat: number; lng: number; city: string } | null> = {
  'Cigarettes After Sex': { lat: 31.7619, lng: -106.4850, city: 'El Paso, TX' },
};

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
  const ADMIN_KEY = process.env.ADMIN_KEY ?? 'Crescent1!';

  // GET — flat list of all artists, with images fetched from Spotify if missing
  if (req.method === 'GET') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/artist_pins?select=id,artists&order=name.asc`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const rows: any[] = await r.json();
    const artists = rows.flatMap(row =>
      (row.artists ?? []).map((a: any) => ({ ...a, pinId: row.id }))
    );

    // Batch-fetch images for artists missing imageUrl
    const missing = artists.filter(a => !a.imageUrl).map(a => a.spotifyArtistId);
    if (missing.length > 0) {
      try {
        const token = await getSpotifyToken();
        const chunks: string[][] = [];
        for (let i = 0; i < missing.length; i += 50) chunks.push(missing.slice(i, i + 50));
        const imageMap: Record<string, string> = {};
        for (const chunk of chunks) {
          const sr = await fetch(`https://api.spotify.com/v1/artists?ids=${chunk.join(',')}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const sd = await sr.json();
          for (const a of sd.artists ?? []) {
            if (a?.id) imageMap[a.id] = a.images?.[2]?.url ?? a.images?.[1]?.url ?? a.images?.[0]?.url ?? null;
          }
        }
        for (const a of artists) {
          if (!a.imageUrl && imageMap[a.spotifyArtistId]) a.imageUrl = imageMap[a.spotifyArtistId];
        }
      } catch {}
    }

    return res.json(artists);
  }

  if (req.headers['x-admin-key'] !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  // POST — add artist by spotifyArtistId, run full pipeline
  if (req.method === 'POST') {
    const { spotifyArtistId } = req.body;
    if (!spotifyArtistId) return res.status(400).json({ error: 'spotifyArtistId required' });

    const token = await getSpotifyToken();
    const artistRes = await fetch(`https://api.spotify.com/v1/artists/${spotifyArtistId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const artist = await artistRes.json();
    if (!artist.name) return res.status(404).json({ error: 'Artist not found' });

    const imageUrl = artist.images?.[2]?.url ?? artist.images?.[1]?.url ?? artist.images?.[0]?.url ?? null;

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
    if (!loc) return res.status(422).json({ error: `Could not determine location for "${artist.name}"` });

    const locKey = `${loc.lat.toFixed(1)},${loc.lng.toFixed(1)}`;
    const pinId = `loc-${locKey.replace(',', '_')}`;

    const existingRes = await fetch(`${SUPABASE_URL}/rest/v1/artist_pins?id=eq.${pinId}&select=artists`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const existingRows: any[] = await existingRes.json();
    const existingArtists: any[] = existingRows[0]?.artists ?? [];

    if (existingArtists.some((a: any) => a.spotifyArtistId === spotifyArtistId)) {
      return res.status(409).json({ error: 'Already in collection' });
    }

    const mergedArtists = [...existingArtists, { name: artist.name, spotifyArtistId, imageUrl }];

    await fetch(`${SUPABASE_URL}/rest/v1/artist_pins`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify([{
        id: pinId,
        name: loc.city,
        lat: loc.lat,
        lng: loc.lng,
        description: mergedArtists[0].name,
        query_keywords: mergedArtists.map((a: any) => a.name).join(' '),
        spotify_artist_id: mergedArtists[0].spotifyArtistId,
        artists: mergedArtists,
        wiki_query: loc.city,
        updated_at: new Date().toISOString(),
      }]),
    });

    return res.json({ success: true, artist: artist.name, city: loc.city });
  }

  // DELETE — remove one artist by spotifyArtistId
  if (req.method === 'DELETE') {
    const { artistId } = req.query;
    if (!artistId || typeof artistId !== 'string') return res.status(400).json({ error: 'artistId required' });

    const allRes = await fetch(`${SUPABASE_URL}/rest/v1/artist_pins?select=id,artists`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    const allPins: any[] = await allRes.json();
    const pin = allPins.find(p => (p.artists ?? []).some((a: any) => a.spotifyArtistId === artistId));
    if (!pin) return res.status(404).json({ error: 'Artist not found' });

    const remaining = (pin.artists ?? []).filter((a: any) => a.spotifyArtistId !== artistId);
    if (remaining.length === 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/artist_pins?id=eq.${pin.id}`, {
        method: 'DELETE',
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      });
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/artist_pins?id=eq.${pin.id}`, {
        method: 'PATCH',
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artists: remaining,
          description: remaining[0].name,
          query_keywords: remaining.map((a: any) => a.name).join(' '),
          spotify_artist_id: remaining[0].spotifyArtistId,
        }),
      });
    }
    return res.json({ success: true });
  }

  return res.status(405).end();
}
