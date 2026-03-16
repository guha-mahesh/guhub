import type { VercelRequest, VercelResponse } from '@vercel/node';

async function fetchWikiImage(q: string): Promise<{ image: string; description: string; extract: string; url: string } | null> {
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.trim())}`, {
      headers: { 'User-Agent': 'guha.one/1.0' },
    });
    if (!r.ok) return null;
    const d = await r.json();
    if (!d.thumbnail?.source || d.type?.includes('error') || d.type === 'disambiguation') return null;
    return {
      image: d.thumbnail.source,
      description: d.description ?? '',
      extract: d.extract ?? '',
      url: d.content_urls?.desktop?.page ?? '',
    };
  } catch { return null; }
}

async function fetchSpotifyArtistImage(artistName: string): Promise<string | null> {
  try {
    // Use MusicBrainz to get artist ID, then get image from fanart.tv or just use Wikipedia
    const mb = await fetch(
      `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(artistName)}&limit=1&fmt=json`,
      { headers: { 'User-Agent': 'guha.one/1.0 (guhamaheshv@gmail.com)' } }
    );
    if (!mb.ok) return null;
    const mbData = await mb.json();
    const artist = mbData?.artists?.[0];
    if (!artist) return null;
    // Try Wikipedia relation
    const wpRelation = artist.relations?.find((r: any) => r.type === 'wikipedia');
    if (wpRelation?.url?.resource) {
      const title = wpRelation.url.resource.split('/wiki/')[1];
      if (title) {
        const result = await fetchWikiImage(title);
        if (result) return result.image;
      }
    }
    return null;
  } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=86400');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing q' });

  // q can be comma-separated (may arrive as %2C encoded or literal ,)
  const raw = Array.isArray(q) ? q.join(',') : q;
  const queries = raw.split(/,|%2C/i).map((s: string) => s.trim()).filter(Boolean);

  try {
    // Try each Wikipedia query in order
    for (const query of queries) {
      const result = await fetchWikiImage(query);
      if (result) {
        return res.json({ image: result.image, description: result.description, extract: result.extract, url: result.url, source: 'wikipedia', query });
      }
    }
    return res.status(404).json({ error: 'No image found', tried: queries });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
