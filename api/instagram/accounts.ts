import type { Request, Response } from 'express';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cltxvvjbukzjktsdrknc.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lypigBq62VpJTg2OzGjahQ_SGho2dlD';

export default async function handler(req: Request, res: Response) {
  try {
    const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/bexly_automations?select=*&order=updated_at.desc&limit=5`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (supaRes.ok) {
      const rows = await supaRes.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const accounts = rows.map((r: any) => ({
          id: String(r.id || r.instagram_user_id),
          instagramUserId: String(r.instagram_user_id || r.id),
          instagramBusinessId: String(r.instagram_user_id || r.id),
          username: r.username,
          name: r.username,
          profilePictureUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.username)}&background=833ab4&color=fff&size=150`,
          followersCount: 0,
          mediaCount: 0,
          connectionStatus: 'connected',
          connectedAt: r.updated_at || new Date().toISOString(),
          accessToken: r.access_token,
        }));

        return res.status(200).json({
          success: true,
          accounts,
        });
      }
    }
  } catch (err) {
    console.warn('[Accounts API] Erro ao consultar Supabase:', err);
  }

  return res.status(200).json({
    success: true,
    accounts: [],
  });
}
