export default function handler(req: any, res: any) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5173';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${host}`;

  const clientId = process.env.META_APP_ID || '1173235938363923';
  const redirectUri = process.env.META_REDIRECT_URI || `${origin}/integrations/instagram/callback`;

  const state = Buffer.from(JSON.stringify({ origin, timestamp: Date.now() })).toString('base64');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: [
      'instagram_business_basic',
      'instagram_business_manage_comments',
      'instagram_business_manage_messages',
    ].join(','),
    response_type: 'code',
    state,
  });

  res.status(200).json({
    url: `https://api.instagram.com/oauth/authorize?${params.toString()}`,
    state,
  });
}
