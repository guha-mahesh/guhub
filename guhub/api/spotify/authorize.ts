// api/spotify/authorize.ts
// GET /api/spotify/authorize
// Redirects you to Spotify's OAuth page. Visit once, then store the refresh token.
// Scopes: user-read-currently-playing user-read-playback-state user-modify-playback-state

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI!;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: redirectUri,
  });

  return res.redirect(`https://accounts.spotify.com/authorize?${params}`);
}
