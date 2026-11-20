import type { Request, Response } from 'express';

const META_API_VERSION = process.env.META_API_VERSION || 'v21.0';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cltxvvjbukzjktsdrknc.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lypigBq62VpJTg2OzGjahQ_SGho2dlD';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let token = (req.query.access_token as string) ||
    req.headers.authorization?.replace('Bearer ', '') ||
    process.env.META_ACCESS_TOKEN ||
    process.env.INSTAGRAM_ACCESS_TOKEN;

  // Fallback: se não veio na requisição, busca o token no Supabase
  if (!token) {
    try {
      const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/bexly_automations?select=access_token&order=updated_at.desc&limit=1`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      if (supaRes.ok) {
        const rows = await supaRes.json();
        if (rows?.[0]?.access_token) {
          token = rows[0].access_token;
        }
      }
    } catch {
      // Ignora erro de fallback
    }
  }

  if (!token) {
    return res.status(200).json({
      success: true,
      media: [],
      message: 'Nenhum access_token fornecido para carregar posts reais.',
    });
  }

  try {
    const mediaUrl = `https://graph.instagram.com/${META_API_VERSION}/me/media?` + new URLSearchParams({
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
      limit: '50',
      access_token: token,
    }).toString();

    const storiesUrl = `https://graph.instagram.com/${META_API_VERSION}/me/stories?` + new URLSearchParams({
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
      access_token: token,
    }).toString();

    const [mediaRes, storiesRes] = await Promise.all([
      fetch(mediaUrl).catch(() => null),
      fetch(storiesUrl).catch(() => null),
    ]);

    let mediaItems: any[] = [];
    let storyItems: any[] = [];

    if (mediaRes && mediaRes.ok) {
      const data = await mediaRes.json();
      mediaItems = Array.isArray(data.data) ? data.data : [];
    }

    if (storiesRes && storiesRes.ok) {
      const data = await storiesRes.json();
      storyItems = (Array.isArray(data.data) ? data.data : []).map((s: any) => ({
        ...s,
        is_story: true,
        media_type: 'STORY',
      }));
    }

    const combined = [...storyItems, ...mediaItems];

    return res.status(200).json({
      success: true,
      media: combined,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'media_fetch_failed',
      message: err.message || 'Erro ao consultar a API do Instagram.',
    });
  }
}
