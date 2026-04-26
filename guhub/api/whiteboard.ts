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
    const id = req.query.id;
    const filter = id ? `id=eq.${encodeURIComponent(String(id))}` : 'id=gte.0';
    const r = await fetch(`${SUPABASE_URL}/rest/v1/whiteboard?${filter}`, {
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

  const isAdmin = req.query.key === WHITEBOARD_KEY;
  const rows = entries.map(e => {
    const trash = isAdmin
      ? `<button class="trash" data-id="${e.id}" aria-label="delete entry">×</button>`
      : '';
    return `<div class="e">${trash}<div class="t">${esc(e.created_at)}</div><div class="c">${esc(e.content)}</div></div>`;
  }).join('');

  const adminBadge = isAdmin ? `<span class="admin">admin</span>` : '';
  const adminScript = isAdmin ? `<script>
const KEY = ${JSON.stringify(String(req.query.key))};
document.querySelectorAll('.trash').forEach(b => {
  b.addEventListener('click', async () => {
    const id = b.dataset.id;
    if (!confirm('delete this entry?')) return;
    b.disabled = true;
    b.textContent = '…';
    const r = await fetch('/api/whiteboard?id=' + id + '&key=' + encodeURIComponent(KEY), { method: 'DELETE' });
    if (r.ok) {
      const e = b.closest('.e');
      e.style.transition = 'opacity .2s';
      e.style.opacity = '0';
      setTimeout(() => e.remove(), 200);
    } else {
      b.disabled = false;
      b.textContent = '×';
      alert('delete failed: ' + r.status);
    }
  });
});
</script>` : '';

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>massive whiteboard</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}
body{font-family:ui-monospace,'IBM Plex Mono',Menlo,monospace;background:#f4f1ea;color:#1a1a1a;max-width:900px;margin:0 auto;padding:2rem;line-height:1.55}
h1{font-size:.9rem;margin:0 0 2rem;opacity:.5;font-weight:400;letter-spacing:.05em;text-transform:uppercase;display:flex;gap:.75rem;align-items:center}
.admin{font-size:.65rem;background:#1a1a1a;color:#f4f1ea;padding:.15rem .4rem;border-radius:2px;letter-spacing:.08em;opacity:1}
.e{position:relative;margin:0 0 1.75rem;padding:0 0 1.75rem;border-bottom:1px solid rgba(0,0,0,.08)}
.e:last-child{border-bottom:none}
.t{font-size:.7rem;opacity:.4;margin-bottom:.5rem}
.c{white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word}
.empty{opacity:.4;font-style:italic}
.trash{position:absolute;top:-.1rem;right:0;background:none;border:1px solid rgba(0,0,0,.15);color:inherit;font:inherit;font-size:1rem;line-height:1;width:1.6rem;height:1.6rem;cursor:pointer;opacity:.3;transition:opacity .15s,background .15s,border-color .15s,color .15s;border-radius:2px;padding:0;display:flex;align-items:center;justify-content:center}
.trash:hover{opacity:1;background:#c44;border-color:#c44;color:#fff}
.trash:disabled{cursor:wait;opacity:.5}
@media (prefers-color-scheme:dark){
  body{background:#111;color:#e8e8e8}
  .e{border-bottom-color:rgba(255,255,255,.08)}
  .admin{background:#e8e8e8;color:#111}
  .trash{border-color:rgba(255,255,255,.18)}
}
</style></head><body><h1>massive whiteboard — ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}${adminBadge}</h1>${rows || '<div class="empty">nothing here yet</div>'}${adminScript}</body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
}
