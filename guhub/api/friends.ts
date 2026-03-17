import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = 'https://lfgoungeysgkwvbjhueq.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZ291bmdleXNna3d2YmpodWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MjEzNDUsImV4cCI6MjA4OTE5NzM0NX0.LcOrpwZf2wNpa1DZluSs-DZ50SsgjyUYrrWOQ1xeN4I';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const isAdmin = req.headers['x-admin-key'] === (process.env.ADMIN_KEY ?? 'Crescent1!');

  if (req.method === 'GET') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/friends?select=*&order=name.asc`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    });
    return res.json(await r.json());
  }

  if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/friends`, {
      method: 'POST',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(req.body),
    });
    return res.status(r.status).json(await r.json());
  }

  if (req.method === 'PUT') {
    const { id, ...body } = req.body;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/friends?id=eq.${id}`, {
      method: 'PATCH',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(body),
    });
    return res.status(r.status).json(await r.json());
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/friends?id=eq.${id}`, {
      method: 'DELETE',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    return res.status(r.status).end();
  }

  return res.status(405).end();
}
