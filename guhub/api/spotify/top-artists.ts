import type { VercelRequest, VercelResponse } from '@vercel/node';

const WD_UA = 'guha.one/1.0 (guhamaheshv@gmail.com)';

// Q-IDs for "instance of" values that indicate a music group/artist
const MUSIC_INSTANCE_QIDS = new Set([
  'Q215380', // musical group
  'Q5741069', // musical duo
  'Q2088357', // musical ensemble
  'Q215627',  // person (solo artist)
  'Q5',       // human
  'Q3740104', // indie rock band
  'Q14623351',// rock band
]);

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

// Search Wikidata for artist — returns QID only if it's a music entity
async function searchWikidataArtist(name: string, spotifyId: string): Promise<string | null> {
  try {
    // Search up to 5 results and pick the music one
    const r = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&format=json&limit=5&type=item`,
      { headers: { 'User-Agent': WD_UA } }
    );
    const d = await r.json();
    const candidates: string[] = d.search?.map((x: any) => x.id) ?? [];
    if (!candidates.length) return null;

    // Fetch P31 (instance of) for all candidates at once
    const r2 = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${candidates.join('|')}&props=claims&format=json`,
      { headers: { 'User-Agent': WD_UA } }
    );
    const d2 = await r2.json();

    for (const qid of candidates) {
      const claims = d2.entities?.[qid]?.claims ?? {};
      const instanceOfs: string[] = (claims.P31 ?? []).map(
        (s: any) => s?.mainsnak?.datavalue?.value?.id
      ).filter(Boolean);
      // Accept if any P31 value is a music type, OR if it has P740 (location of formation = music indicator)
      const isMusic = instanceOfs.some(q => MUSIC_INSTANCE_QIDS.has(q)) || 'P740' in claims;
      if (isMusic) return qid;
    }
    return null;
  } catch { return null; }
}

async function fetchClaims(qids: string[]): Promise<Record<string, any>> {
  if (!qids.length) return {};
  try {
    const r = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qids.join('|')}&props=claims&format=json`,
      { headers: { 'User-Agent': WD_UA } }
    );
    const d = await r.json();
    return d.entities ?? {};
  } catch { return {}; }
}

async function fetchLocations(qids: string[]): Promise<Record<string, { lat: number; lng: number; city: string }>> {
  if (!qids.length) return {};
  try {
    const r = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qids.join('|')}&props=claims|labels&format=json&languages=en`,
      { headers: { 'User-Agent': WD_UA } }
    );
    const d = await r.json();
    const out: Record<string, { lat: number; lng: number; city: string }> = {};
    for (const [qid, entity] of Object.entries(d.entities ?? {}) as [string, any][]) {
      const coords = entity?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
      if (coords?.latitude) {
        out[qid] = { lat: coords.latitude, lng: coords.longitude, city: entity?.labels?.en?.value ?? qid };
      }
    }
    return out;
  } catch { return {}; }
}

async function batch<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    results.push(...await Promise.all(items.slice(i, i + size).map(fn)));
  }
  return results;
}

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

    // Step 1: Find music-verified QID for each artist (batches of 5)
    const withQids = await batch(artists, 5, async (artist) => ({
      artist,
      qid: await searchWikidataArtist(artist.name, artist.id),
    }));
    const validQids = withQids.filter(x => x.qid) as { artist: any; qid: string }[];

    // Step 2: Bulk fetch claims for all verified artist QIDs
    const claimsMap = await fetchClaims(validQids.map(x => x.qid));

    // Step 3: Extract P740 (location of formation) QIDs
    const locationNeeded = new Map<string, string>(); // locQid -> artistQid
    for (const { qid } of validQids) {
      const claims = claimsMap[qid]?.claims ?? {};
      const locQid = claims.P740?.[0]?.mainsnak?.datavalue?.value?.id
                  ?? claims.P159?.[0]?.mainsnak?.datavalue?.value?.id;
      if (locQid) locationNeeded.set(locQid, qid);
    }

    // Step 4: Bulk fetch location coords
    const locData = await fetchLocations([...locationNeeded.keys()]);

    // Step 5: Build artist -> location map
    const artistLocMap = new Map<string, { lat: number; lng: number; city: string }>();
    for (const [locQid, artistQid] of locationNeeded.entries()) {
      const loc = locData[locQid];
      if (loc) artistLocMap.set(artistQid, loc);
    }

    // Step 6: Build deduplicated pins
    const seen = new Set<string>();
    const pins = validQids
      .map(({ artist, qid }) => {
        const loc = artistLocMap.get(qid);
        if (!loc) return null;
        // Drop if city name matches artist name — almost always a wrong Wikidata mapping
        // (e.g. band "El Paso" resolving to the city "El Paso, Illinois")
        if (loc.city.toLowerCase().startsWith(artist.name.toLowerCase())) return null;
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
