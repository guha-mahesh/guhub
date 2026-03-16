import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });

  try {
    const html = await fetch(`https://open.spotify.com/embed/track/${id}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    }).then(r => r.text());

    const match = html.match(/"audioPreview"\s*:\s*\{\s*"url"\s*:\s*"([^"]+)"/);
    if (!match) return res.status(404).json({ error: 'No preview found' });

    return res.json({ previewUrl: match[1] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
