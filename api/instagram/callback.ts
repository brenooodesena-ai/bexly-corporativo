import type { Request, Response } from 'express';

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || '1734960207599537';
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || '1474c6eaa7396f0016fe59ecef4617c9';
const META_APP_ID = process.env.META_APP_ID || '28710878855238960';
const META_APP_SECRET = process.env.META_APP_SECRET || '7b4fc711eea8e8f88fe96e3f87c74d15';
const META_API_VERSION = process.env.META_API_VERSION || 'v21.0';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code, state } = req.body || {};

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  let redirectUri = 'https://bexly-two.vercel.app/integrations/instagram/callback';
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      if (decoded.redirectUri) redirectUri = decoded.redirectUri;
    } catch {
      // ignore
    }
  }

  try {
    let accessToken = '';

    // 1. Try Instagram OAuth endpoint
    const igForm = new URLSearchParams({
      client_id: INSTAGRAM_APP_ID,
      client_secret: INSTAGRAM_APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    });

    const igTokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: igForm.toString(),
    });

    if (igTokenRes.ok) {
      const data = await igTokenRes.json();
      accessToken = data.access_token;
    } else {
      // 2. Fallback to Facebook Graph OAuth
      const fbUrl = `https://graph.facebook.com/${META_API_VERSION}/oauth/access_token?` + new URLSearchParams({
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        redirect_uri: redirectUri,
        code,
      }).toString();

      const fbTokenRes = await fetch(fbUrl);
      if (fbTokenRes.ok) {
        const data = await fbTokenRes.json();
        accessToken = data.access_token;
      } else {
        const errJson = await igTokenRes.json().catch(() => ({}));
        return res.status(400).json({
          error: 'token_exchange_failed',
          message: errJson.error_message || 'Falha ao trocar código de autorização por token.',
        });
      }
    }

    // 3. Try to exchange for 60-day long-lived token
    try {
      const longRes = await fetch(`https://graph.instagram.com/access_token?` + new URLSearchParams({
        grant_type: 'ig_exchange_token',
        client_secret: INSTAGRAM_APP_SECRET,
        access_token: accessToken,
      }).toString());
      if (longRes.ok) {
        const longData = await longRes.json();
        if (longData.access_token) {
          accessToken = longData.access_token;
        }
      }
    } catch {
      // keep short token if long-lived exchange fails
    }

    // 4. Fetch User Profile
    let profile = { id: 'ig_' + Date.now(), username: 'instagram_user', name: 'Instagram User', profile_picture_url: '' };
    try {
      const profRes = await fetch(`https://graph.instagram.com/${META_API_VERSION}/me?` + new URLSearchParams({
        fields: 'id,username,name,profile_picture_url',
        access_token: accessToken,
      }).toString());
      if (profRes.ok) {
        profile = await profRes.json();
      }
    } catch {
      // use fallback profile
    }

    const account = {
      id: profile.id,
      instagramUserId: profile.id,
      username: profile.username || 'instagram_user',
      name: profile.name || profile.username || 'Instagram User',
      profilePictureUrl: profile.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username || 'IG')}&background=833ab4&color=fff`,
      followersCount: 0,
      mediaCount: 0,
      connectionStatus: 'connected',
      connectedAt: new Date().toISOString(),
      accessToken,
    };

    return res.status(200).json({
      success: true,
      account,
      message: 'Instagram conectado com sucesso via Vercel!',
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'internal_error',
      message: err.message || 'Erro interno no callback da Vercel.',
    });
  }
}

