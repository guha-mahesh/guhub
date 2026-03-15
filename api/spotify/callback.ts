// api/spotify/callback.ts
// GET /api/spotify/callback?code=XXX
// After Spotify redirects back, exchanges the code for tokens.
// Prints the refresh_token to the response — copy it into SPOTIFY_REFRESH_TOKEN env var.
// You only need to run this ONCE.

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error } = req.query;

  if (error) return res.status(400).send(`Spotify OAuth error: ${error}`);
  if (!code || typeof code !== 'string') return res.status(400).send('Missing code');

  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI!;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await r.json();

  return res.send(`
    <html><body style="font-family:monospace;padding:2rem;background:#0a0a0a;color:#f0f0f0">
      <h2>✓ OAuth complete</h2>
      <p>Add this to your Vercel environment variables:</p>
      <pre style="background:#111;padding:1rem;border:1px solid #333">SPOTIFY_REFRESH_TOKEN=${data.refresh_token}</pre>
      <p style="color:#666">You can delete api/spotify/authorize.ts and api/spotify/callback.ts after this.</p>
    </body></html>
  `);
}
