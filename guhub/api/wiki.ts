import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=86400');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q || typeof q !== 'string') return res.status(400).json({ error: 'Missing q' });

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'guha.one/1.0' } });
    if (!r.ok) return res.status(404).json({ error: 'Not found' });
    const data = await r.json();
    return res.json({
      title: data.title,
      description: data.description,
      extract: data.extract,
      image: data.thumbnail?.source ?? null,
      imageWidth: data.thumbnail?.width ?? null,
      imageHeight: data.thumbnail?.height ?? null,
      url: data.content_urls?.desktop?.page ?? null,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
