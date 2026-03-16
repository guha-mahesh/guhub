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

async function wikidataCoords(artistName: string): Promise<{ lat: number; lng: number; city: string } | null> {
  try {
    // Search for entity
    const searchRes = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(artistName)}&language=en&format=json&limit=1&type=item`
    );
    const searchData = await searchRes.json();
    const qid = searchData.search?.[0]?.id;
    if (!qid) return null;

    // Get claims
    const entityRes = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=claims&format=json`
    );
    const entityData = await entityRes.json();
    const claims = entityData.entities?.[qid]?.claims ?? {};

    // Try P740 (location of formation) then P159 (headquarters)
    for (const prop of ['P740', 'P159', 'P17']) {
      const val = claims[prop]?.[0]?.mainsnak?.datavalue?.value;
      if (!val?.id) continue;

      // Resolve that location entity's coords (P625)
      const locRes = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${val.id}&props=claims|labels&format=json&languages=en`
      );
      const locData = await locRes.json();
      const locEntity = locData.entities?.[val.id];
      const coords = locEntity?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
      if (coords?.latitude) {
        const city = locEntity?.labels?.en?.value ?? artistName;
        return { lat: coords.latitude, lng: coords.longitude, city };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const token = await getAccessToken();
    const r = await fetch(
      'https://api.spotify.com/v1/me/top/artists?limit=30&time_range=medium_term',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await r.json();
    const artists: any[] = data.items ?? [];

    // Resolve locations in parallel (with concurrency limit)
    const results = await Promise.all(
      artists.map(async (artist) => {
        const loc = await wikidataCoords(artist.name);
        if (!loc) return null;
        return {
          id: `music-${artist.id}`,
          name: loc.city,
          lat: loc.lat,
          lng: loc.lng,
          category: 'interest',
          description: artist.name,
          queryKeywords: `${artist.name} music`,
        };
      })
    );

    // Deduplicate by rounding coords to 1 decimal (nearby cities merge)
    const seen = new Set<string>();
    const pins = results.filter((p): p is NonNullable<typeof p> => {
      if (!p) return false;
      const key = `${p.lat.toFixed(1)},${p.lng.toFixed(1)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=3600'); // 12hr cache
    return res.json({ pins });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
