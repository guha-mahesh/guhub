import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Two jobs in one function, because Vercel's Hobby plan caps deployments at
 * 12 serverless functions and this project sits on that line:
 *
 *   GET /api/phenovec/status?u=<id>            job progress (polled by /recs)
 *   GET /api/phenovec/results?u=<id>&k=<token> the finished page, as a download
 *
 * The second is routed here by a rewrite in vercel.json, so the link people
 * receive still reads /api/phenovec/results.
 *
 * Both proxy to Modal so the browser stays same-origin, no Modal URL ends up in
 * the bundle, and those URLs can move without breaking links already sitting in
 * someone's inbox. Modal checks the token; nothing is trusted here.
 */

async function results(req: VercelRequest, res: VercelResponse) {
  const base = process.env.PHENOVEC_RESULTS_MODAL_URL;
  if (!base) return res.status(500).json({ error: 'PHENOVEC_RESULTS_MODAL_URL not set' });

  const { u, k } = req.query as Record<string, string>;
  if (!u || !k) return res.status(400).send('missing link parameters');

  const r = await fetch(`${base}?u=${encodeURIComponent(u)}&k=${encodeURIComponent(k)}`);
  if (!r.ok) return res.status(r.status).send(await r.text());

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    r.headers.get('content-disposition') ?? `inline; filename="${u}-recommendations.html"`,
  );
  res.setHeader('Cache-Control', 'private, no-store');
  return res.send(await r.text());
}

async function status(req: VercelRequest, res: VercelResponse) {
  const base = process.env.PHENOVEC_STATUS_URL;
  if (!base) return res.status(500).json({ error: 'PHENOVEC_STATUS_URL not set' });

  const userId = (req.query.u ?? req.query.user) as string | undefined;
  if (!userId) return res.status(400).json({ error: 'missing ?u=<user_id>' });

  const r = await fetch(`${base}?u=${encodeURIComponent(userId)}`);
  const body = await r.text();
  // Pass the upstream status through. The page relies on 404 meaning
  // "not enrolled yet" and keeps polling rather than showing an error.
  res.status(r.status);
  res.setHeader('Content-Type', 'application/json');
  return res.send(body);
}

/**
 * Approve / deny / retry, proxied so the Modal secret never reaches a browser.
 *
 * Gated on PHENOVEC_ADMIN_KEY. Worth being honest about the strength: guhub's
 * admin password already ships inside the client bundle, so this stops casual
 * pokes at the endpoint, not a determined person reading the JS.
 */
async function admin(req: VercelRequest, res: VercelResponse) {
  const url = process.env.PHENOVEC_ADMIN_URL;
  const secret = process.env.PHENOVEC_TRIGGER_SECRET;
  const adminKey = process.env.PHENOVEC_ADMIN_KEY;
  if (!url || !secret) return res.status(500).json({ error: 'admin not configured' });

  if (adminKey && req.headers['x-admin-key'] !== adminKey) {
    return res.status(401).json({ error: 'not authorised' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {});
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, secret }),
  });
  res.status(r.status);
  res.setHeader('Content-Type', 'application/json');
  return res.send(await r.text());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const url = req.url ?? '';
    if (req.query.action === 'admin' || url.includes('/admin')) return await admin(req, res);
    const wantsResults = req.query.action === 'results' || url.includes('/results');
    return wantsResults ? await results(req, res) : await status(req, res);
  } catch (e: unknown) {
    return res.status(502).json({ error: (e as Error).message });
  }
}
