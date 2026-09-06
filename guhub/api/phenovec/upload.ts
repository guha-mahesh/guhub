import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Streams a library export through to the Modal `upload` endpoint.
 *
 * A proxy rather than a direct browser call so the page stays same-origin (no
 * CORS, no Modal URL in the bundle) and the Modal URL can move without a
 * frontend rebuild. Modal does the parsing, since the plist/CSV readers live
 * in Python next to the pipeline.
 */

export const config = {
  api: {
    // Pass the multipart body through untouched. Vercel's default parser would
    // consume it and Modal would receive nothing.
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const target = process.env.PHENOVEC_UPLOAD_URL;
  if (!target) return res.status(500).json({ error: 'PHENOVEC_UPLOAD_URL not set' });

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const body = Buffer.concat(chunks);

    const r = await fetch(target, {
      method: 'POST',
      // Keep the original multipart boundary, or the far side can't split it.
      headers: { 'content-type': req.headers['content-type'] ?? 'application/octet-stream' },
      body,
    });

    const text = await r.text();
    res.status(r.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(text);
  } catch (e: unknown) {
    return res.status(502).json({ error: (e as Error).message });
  }
}
