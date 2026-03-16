import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = 'https://lfgoungeysgkwvbjhueq.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZ291bmdleXNna3d2YmpodWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MjEzNDUsImV4cCI6MjA4OTE5NzM0NX0.LcOrpwZf2wNpa1DZluSs-DZ50SsgjyUYrrWOQ1xeN4I';

// Read cached pins from Supabase — instant response
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Read from cache
    const r = await fetch(`${SUPABASE_URL}/rest/v1/artist_pins?select=id,name,lat,lng,description,artists,spotify_artist_id,wiki_query,updated_at&order=updated_at.desc`, {
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
      // If multiple artists share this city, join them; otherwise use description
      description: (row.artists?.length > 1)
        ? row.artists.map((a: any) => a.name).join(', ')
        : (row.description ?? row.artists?.[0]?.name ?? ''),
      queryKeywords: row.query_keywords,
      spotifyArtistId: row.spotify_artist_id,
      artists: row.artists ?? [],
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
