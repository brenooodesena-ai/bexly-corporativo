/**
/**
 * Vercel Serverless Function: Meta / Instagram Webhook Handler
 * Endpoint: /api/webhooks/meta
 */
import type { Request, Response } from 'express';

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'bexly_webhook_verify_2025';
const META_API_VERSION = process.env.META_API_VERSION || 'v21.0';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cltxvvjbukzjktsdrknc.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lypigBq62VpJTg2OzGjahQ_SGho2dlD';

export default async function handler(req: Request, res: Response) {
  // ── 1. GET: Webhook Verification from Meta ──
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Bexly Webhook] Verificado com sucesso pela Meta!');
      return res.status(200).send(challenge);
    } else {
      console.warn('[Bexly Webhook] Falha na verificação de token:', { mode, tokenMatch: token === VERIFY_TOKEN });
      return res.status(403).send('Verification failed');
    }
  }

  // ── 2. POST: Event Notification (Comments, Mentions, DMs) ──
  if (req.method === 'POST') {
    // Meta strictly requires an immediate 200 OK response (< 20s)
    res.status(200).send('EVENT_RECEIVED');

    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!payload || payload.object !== 'instagram') return;

      const entries = Array.isArray(payload.entry) ? payload.entry : [];
      for (const entry of entries) {
        const instagramUserId = entry.id;
        const changes = Array.isArray(entry.changes) ? entry.changes : [];

        // 1. Fetch user token and automation rules from Supabase
        let token = process.env.META_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN || '';
        let automations: any[] = [];

        try {
          const supaRes = await fetch(
            `${SUPABASE_URL}/rest/v1/bexly_automations?select=*&order=updated_at.desc&limit=5`,
            {
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
              },
            }
          );
          if (supaRes.ok) {
            const rows = await supaRes.json();
            const matchedRow = rows.find((r: any) => r.instagram_user_id === instagramUserId) || rows[0];
            if (matchedRow) {
              if (matchedRow.access_token) token = matchedRow.access_token;
              if (Array.isArray(matchedRow.rules)) automations = matchedRow.rules;
            }
          }
        } catch (supaErr) {
          console.warn('[Bexly Webhook] Não foi possível consultar Supabase:', supaErr);
        }

        for (const change of changes) {
          if (change.field === 'comments') {
            const val = change.value;
            const commentId = val?.id;
            const commentText = (val?.text || '').trim();
            const commenterUsername = val?.from?.username;
            const commenterId = val?.from?.id;
            const mediaId = val?.media?.id;

            // Strict Meta Rule: ignore comments made by the media owner on their own post
            if (commenterId && commenterId === instagramUserId) {
              console.log(`[Bexly Webhook] Ignorando comentário próprio do dono do post (@${commenterUsername})`);
              continue;
            }

            console.log(`[Bexly Webhook] Comentário recebido de @${commenterUsername}: "${commentText}" no post ${mediaId}`);

            if (!token || !commentId) {
              console.warn('[Bexly Webhook] Nenhum token disponível para responder ao comentário.');
              continue;
            }

            // Check if comment matches active automations
            let matchedRule: any = null;
            if (automations.length > 0) {
              matchedRule = automations.find((a: any) => {
                if (a.status !== 'active') return false;
                const postMatch = a.trigger?.postId === 'all' || a.trigger?.postId === mediaId;
                if (!postMatch) return false;

                const conditions = Array.isArray(a.conditions) ? a.conditions : [];
                return conditions.some((cond: any) => {
                  const kw = (cond.keyword || '').trim().toLowerCase();
                  return kw && commentText.toLowerCase().includes(kw);
                });
              });
            }

            // Messages to send
            const publicReplyText = matchedRule?.actions?.find((act: any) => act.type === 'reply_comment')?.config?.message ||
              'Acabei de te enviar no direct! 🚀 Dá uma olhada lá!';
            const dmText = matchedRule?.actions?.find((act: any) => act.type === 'send_dm')?.config?.message ||
              'Olá! 👋 Conforme solicitado no comentário, aqui está o seu acesso prioritário da Bexly: https://bexly.com.br';

            // 1. Reply publicly to comment
            try {
              const replyRes = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${commentId}/replies`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: publicReplyText }),
              });
              if (!replyRes.ok) {
                // Try with graph.instagram.com
                await fetch(`https://graph.instagram.com/${META_API_VERSION}/${commentId}/replies`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ message: publicReplyText }),
                });
              }
              console.log(`[Bexly Webhook] Resposta pública enviada no comentário ${commentId}`);
            } catch (replyErr) {
              console.warn('[Bexly Webhook] Erro ao responder comentário publicamente:', replyErr);
            }

            // 2. Send Private DM to commenter
            try {
              const dmRes = await fetch(`https://graph.facebook.com/${META_API_VERSION}/me/messages`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  recipient: { comment_id: commentId },
                  message: { text: dmText },
                }),
              });
              if (!dmRes.ok) {
                await fetch(`https://graph.instagram.com/${META_API_VERSION}/me/messages`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    recipient: { comment_id: commentId },
                    message: { text: dmText },
                  }),
                });
              }
              console.log(`[Bexly Webhook] Direct enviado para comentário ${commentId}`);
            } catch (dmErr) {
              console.warn('[Bexly Webhook] Erro ao enviar Direct:', dmErr);
            }
          }
        }
      }
    } catch (err) {
      console.error('[Bexly Webhook] Erro ao processar payload da Meta:', err);
    }
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
