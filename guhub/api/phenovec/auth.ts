import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

/**
 * Multi-user Spotify OAuth for the recommendation experiment.
 *
 * The existing /api/spotify/* endpoints run on a single refresh token in an env
 * var. That's Guha's own account, powering now-playing on the site. This is
 * separate: each visitor gets their own refresh token, because the job has to
 * read *their* library.
 *
 * State lives in a Modal Dict rather than Supabase (that project no longer
 * exists), so the callback hands the token straight to the Modal `enroll`
 * endpoint. One function serves both legs of the flow to stay under the Vercel
 * function limit; the callback leg is the one carrying ?code.
 */

// user-read-email is here so results can be mailed without asking for the
// address a second time. It costs one extra line on the consent screen.
const SCOPES = [
  'user-top-read',
  'user-library-read',
  'playlist-read-private',
  'user-read-email',
].join(' ');

function redirectUri(req: VercelRequest): string {
  if (process.env.PHENOVEC_REDIRECT_URI) return process.env.PHENOVEC_REDIRECT_URI;
  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'https';
  return `${proto}://${req.headers.host}/api/phenovec/auth`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Spotify credentials are not configured' });
  }

  const { code, state, error: denied } = req.query as Record<string, string>;

  if (denied) return res.redirect(302, '/recs?status=denied');

  // --- Leg 1: send the user to Spotify ------------------------------------
  if (!code) {
    const nonce = crypto.randomBytes(16).toString('hex');
    // Spotify echoes state back; pairing it with an HttpOnly cookie is what
    // stops an attacker replaying their own code against this callback.
    res.setHeader(
      'Set-Cookie',
      `pv_state=${nonce}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900`,
    );
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri(req),
      scope: SCOPES,
      state: nonce,
      show_dialog: 'true',
    });
    return res.redirect(302, `https://accounts.spotify.com/authorize?${params}`);
  }

  // --- Leg 2: exchange the code -------------------------------------------
  const cookies = Object.fromEntries(
    (req.headers.cookie ?? '').split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    }),
  );
  if (!state || cookies.pv_state !== state) {
    return res.status(400).json({ error: 'state mismatch' });
  }

  try {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri(req),
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.refresh_token) {
      return res.status(400).json({ error: 'no refresh_token', detail: tokens });
    }

    const meRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const me = await meRes.json();
    if (!me?.id) return res.status(400).json({ error: 'could not read Spotify profile' });

    const enrollUrl = process.env.PHENOVEC_ENROLL_URL;
    if (!enrollUrl) return res.status(500).json({ error: 'PHENOVEC_ENROLL_URL not set' });

    // Awaited, not fire-and-forget: if this fails the token is lost and the
    // friend would sit on a page that never resolves.
    const enroll = await fetch(enrollUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spotify_user_id: me.id,
        display_name: me.display_name ?? me.id,
        email: me.email ?? null,
        refresh_token: tokens.refresh_token,
        secret: process.env.PHENOVEC_TRIGGER_SECRET ?? '',
      }),
    });
    if (!enroll.ok) {
      return res.status(502).json({ error: 'could not enroll', detail: await enroll.text() });
    }

    res.setHeader('Set-Cookie', 'pv_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    return res.redirect(302, `/recs?status=pending&u=${encodeURIComponent(me.id)}`);
  } catch (e: unknown) {
    return res.status(500).json({ error: (e as Error).message });
  }
}
