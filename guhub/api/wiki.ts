import type { VercelRequest, VercelResponse } from '@vercel/node';

async function fetchWiki(q: string) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'guha.one/1.0' } });
  if (!r.ok) return null;
  const data = await r.json();
  if (data.type === 'disambiguation' || data.type?.includes('error')) return null;
  if (!data.thumbnail?.source) return null; // require image
  return {
    title: data.title,
    description: data.description ?? '',
    extract: data.extract ?? '',
    image: data.thumbnail.source,
    url: data.content_urls?.desktop?.page ?? null,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=86400');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing q' });

  // q can be a comma-separated list of fallbacks
  const queries = (Array.isArray(q) ? q : [q])
    .flatMap((s: string) => s.split(',').map(x => x.trim()))
    .filter(Boolean);

  try {
    for (const query of queries) {
      const result = await fetchWiki(query);
      if (result) return res.json(result);
    }
    return res.status(404).json({ error: 'No image found for any query' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
