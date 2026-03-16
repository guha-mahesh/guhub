import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = 'https://lfgoungeysgkwvbjhueq.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

// Read cached pins from Supabase — instant response
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Read from cache
    const r = await fetch(`${SUPABASE_URL}/rest/v1/artist_pins?select=*&order=updated_at.desc`, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    });
    const rows: any[] = await r.json();

    const pins = rows.map(row => ({
      id: row.id,
      name: row.name,
      lat: row.lat,
      lng: row.lng,
      category: 'interest',
      description: row.description,
      queryKeywords: row.query_keywords,
      spotifyArtistId: row.spotify_artist_id,
      wikiQuery: row.wiki_query,
    }));

    // If cache is empty or stale (>12hr), trigger async refresh — don't wait for it
    const stale = rows.length === 0 ||
      (rows[0]?.updated_at && Date.now() - new Date(rows[0].updated_at).getTime() > 12 * 60 * 60 * 1000);

    if (stale) {
      // Fire-and-forget — caller gets cached data immediately
      fetch(`${req.headers['x-forwarded-proto'] ?? 'https'}://${req.headers.host}/api/spotify/refresh-pins`, {
        method: 'POST',
        headers: { 'x-refresh-secret': process.env.REFRESH_SECRET ?? 'guha-refresh' },
      }).catch(() => {});
    }

    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.json({ pins, stale });
  } catch (e: any) {
    return res.status(500).json({ error: e.message, pins: [] });
  }
}
