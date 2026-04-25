import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = 'https://lfgoungeysgkwvbjhueq.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZ291bmdleXNna3d2YmpodWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MjEzNDUsImV4cCI6MjA4OTE5NzM0NX0.LcOrpwZf2wNpa1DZluSs-DZ50SsgjyUYrrWOQ1xeN4I';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const WHITEBOARD_KEY = process.env.WHITEBOARD_KEY ?? process.env.ADMIN_KEY ?? 'Crescent1!';

function esc(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const key = req.headers['x-key'] ?? req.query.key;
    if (key !== WHITEBOARD_KEY) return res.status(401).json({ error: 'Unauthorized' });

    let content: string | null = null;
    if (typeof req.body === 'string') content = req.body;
    else if (req.body && typeof req.body === 'object' && 'content' in req.body) content = String(req.body.content);
    if (!content || !content.trim()) return res.status(400).json({ error: 'Missing content' });

    const r = await fetch(`${SUPABASE_URL}/rest/v1/whiteboard`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ content }),
    });
    return res.status(r.status).json(await r.json());
  }

  if (req.method === 'DELETE') {
    const key = req.headers['x-key'] ?? req.query.key;
    if (key !== WHITEBOARD_KEY) return res.status(401).json({ error: 'Unauthorized' });
    const r = await fetch(`${SUPABASE_URL}/rest/v1/whiteboard?id=gte.0`, {
      method: 'DELETE',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    return res.status(r.status).end();
  }

  if (req.method !== 'GET') return res.status(405).end();

  const r = await fetch(`${SUPABASE_URL}/rest/v1/whiteboard?select=*&order=created_at.desc&limit=1000`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  const entries: Array<{ id: number; content: string; created_at: string }> = await r.json();

  if (req.query.format === 'json' || (req.headers.accept ?? '').includes('application/json')) {
    return res.json(entries);
  }

  const rows = entries.map(e => `<div class="e"><div class="t">${esc(e.created_at)}</div><div class="c">${esc(e.content)}</div></div>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>massive whiteboard</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}
body{font-family:ui-monospace,'IBM Plex Mono',Menlo,monospace;background:#f4f1ea;color:#1a1a1a;max-width:900px;margin:0 auto;padding:2rem;line-height:1.55}
h1{font-size:.9rem;margin:0 0 2rem;opacity:.5;font-weight:400;letter-spacing:.05em;text-transform:uppercase}
.e{margin:0 0 1.75rem;padding:0 0 1.75rem;border-bottom:1px solid rgba(0,0,0,.08)}
.e:last-child{border-bottom:none}
.t{font-size:.7rem;opacity:.4;margin-bottom:.5rem}
.c{white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word}
.empty{opacity:.4;font-style:italic}
@media (prefers-color-scheme:dark){body{background:#111;color:#e8e8e8}.e{border-bottom-color:rgba(255,255,255,.08)}}
</style></head><body><h1>massive whiteboard — ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}</h1>${rows || '<div class="empty">nothing here yet</div>'}</body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
}
