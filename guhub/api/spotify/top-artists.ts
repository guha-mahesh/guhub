import type { VercelRequest, VercelResponse } from '@vercel/node';

const WD_UA = 'guha.one/1.0 (guhamaheshv@gmail.com)';

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

// Search Wikidata for a single artist, return QID
async function searchWikidata(name: string): Promise<string | null> {
  try {
    const r = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&format=json&limit=1&type=item`,
      { headers: { 'User-Agent': WD_UA } }
    );
    const d = await r.json();
    return d.search?.[0]?.id ?? null;
  } catch { return null; }
}

// Fetch claims for up to 50 QIDs in one request
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

// Fetch labels+coords for up to 50 location QIDs in one request
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
        out[qid] = {
          lat: coords.latitude,
          lng: coords.longitude,
          city: entity?.labels?.en?.value ?? qid,
        };
      }
    }
    return out;
  } catch { return {}; }
}

// Run in batches with concurrency limit
async function batch<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
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

    // Step 1: Search Wikidata for all artists in batches of 5 concurrent
    const qids = await batch(artists, 5, async (artist) => {
      const qid = await searchWikidata(artist.name);
      return { artist, qid };
    });

    const validQids = qids.filter(x => x.qid) as { artist: any; qid: string }[];

    // Step 2: Fetch all claims in one bulk request (max 50)
    const claimsMap = await fetchClaims(validQids.map(x => x.qid!));

    // Step 3: Extract location QIDs from P740/P159
    const locationNeeded = new Map<string, string>(); // locQid -> artistQid
    for (const { artist, qid } of validQids) {
      const claims = claimsMap[qid!]?.claims ?? {};
      for (const prop of ['P740', 'P159']) {
        const locQid = claims[prop]?.[0]?.mainsnak?.datavalue?.value?.id;
        if (locQid) { locationNeeded.set(locQid, qid!); break; }
      }
    }

    // Step 4: Fetch all location coords in one bulk request
    const locData = await fetchLocations([...locationNeeded.keys()]);

    // Step 5: Build artist -> location map
    const artistLocMap = new Map<string, { lat: number; lng: number; city: string }>();
    for (const [locQid, artistQid] of locationNeeded.entries()) {
      const loc = locData[locQid];
      if (loc) artistLocMap.set(artistQid, loc);
    }

    // Step 6: Build pins
    const seen = new Set<string>();
    const pins = validQids
      .map(({ artist, qid }) => {
        const loc = artistLocMap.get(qid!);
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
