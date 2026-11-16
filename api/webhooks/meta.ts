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
      if (!payload || payload.object !== 'instagram') {
        console.log('[Bexly Webhook] Objeto ignorado (não é instagram):', payload?.object);
        return;
      }

      const entries = Array.isArray(payload.entry) ? payload.entry : [];
      for (const entry of entries) {
        const instagramUserId = String(entry.id || '');
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
            const matchedRow = rows.find((r: any) => String(r.instagram_user_id) === instagramUserId) || rows[0];
            if (matchedRow) {
              if (matchedRow.access_token) token = matchedRow.access_token;
              if (Array.isArray(matchedRow.rules)) automations = matchedRow.rules;
              console.log(`[Bexly Webhook] Regras carregadas do Supabase para @${matchedRow.username}: ${automations.length} regras ativas`);
            }
          }
        } catch (supaErr) {
          console.warn('[Bexly Webhook] Erro ao consultar Supabase:', supaErr);
        }

        for (const change of changes) {
          if (change.field === 'comments') {
            const val = change.value;
            const commentId = String(val?.id || '');
            const commentText = (val?.text || '').trim();
            const commenterUsername = val?.from?.username || 'amigo';
            const commenterId = String(val?.from?.id || '');
            const mediaId = String(val?.media?.id || '');

            console.log(`[Bexly Webhook] Comentário recebido de @${commenterUsername} (${commenterId}) no post ${mediaId}: "${commentText}"`);

            // Strict Meta Rule: ignore comments made by the media owner on their own post
            if (commenterId && commenterId === instagramUserId) {
              console.log(`[Bexly Webhook] Ignorando comentário do próprio dono (@${commenterUsername})`);
              continue;
            }

            if (!token || !commentId) {
              console.warn('[Bexly Webhook] Sem token ou commentId para responder.');
              continue;
            }

            // Check matching automation rule
            let matchedRule: any = null;
            if (automations.length > 0) {
              const cleanComment = commentText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

              matchedRule = automations.find((a: any) => {
                if (a.status !== 'active') return false;

                const conditions = Array.isArray(a.conditions) ? a.conditions : [];
                const keywordMatches = conditions.some((cond: any) => {
                  const rawKw = (cond.keyword || '').trim();
                  if (!rawKw) return false;
                  const cleanKw = rawKw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                  return cleanComment.includes(cleanKw);
                });
                if (!keywordMatches) return false;

                const targetPost = String(a.trigger?.postId || 'all');
                return targetPost === 'all' || targetPost === mediaId || automations.length === 1;
              });
            }

            // Extract responses from matched rule or use fallback
            let publicReplyText = 'Acabei de te enviar no direct! 🚀 Dá uma olhada lá!';
            let dmText = `Olá, @${commenterUsername}! 👋 Conforme solicitado no comentário, aqui está o seu acesso prioritário da Bexly: https://bexly.com.br/acesso-vip`;

            if (matchedRule) {
              console.log(`[Bexly Webhook] Regra correspondida: "${matchedRule.name}" para comentário "${commentText}"`);
              const action = matchedRule.actions?.[0];
              if (action) {
                // Public reply template
                if (action.publicCommentReply?.enabled && Array.isArray(action.publicCommentReply?.replyTemplates) && action.publicCommentReply.replyTemplates.length > 0) {
                  publicReplyText = action.publicCommentReply.replyTemplates[0];
                } else if (action.config?.replyMessage) {
                  publicReplyText = action.config.replyMessage;
                }

                // DM message template
                const rawTemplate = action.messageTemplate || action.config?.dmMessage || dmText;
                const ctaUrl = action.ctaButton?.url || 'https://bexly.com.br';
                dmText = rawTemplate
                  .replace(/\{\{nome\}\}/gi, `@${commenterUsername}`)
                  .replace(/\{\{name\}\}/gi, `@${commenterUsername}`)
                  .replace(/\{\{link\}\}/gi, ctaUrl);
              }
            } else {
              console.log(`[Bexly Webhook] Nenhuma regra específica filtrou o post ${mediaId}. Usando disparo padrão.`);
            }

            // 1. Reply publicly to comment (Official Instagram Graph API)
            try {
              const replyUrl = `https://graph.instagram.com/${META_API_VERSION}/${commentId}/replies`;
              const replyRes = await fetch(replyUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: publicReplyText }),
              });
              const replyJson = await replyRes.json().catch(() => ({}));
              if (replyRes.ok) {
                console.log(`[Bexly Webhook] Resposta pública enviada com sucesso no comentário ${commentId}:`, replyJson);
              } else {
                console.warn(`[Bexly Webhook] Falha ao responder comentário:`, replyJson);
              }
            } catch (replyErr) {
              console.warn('[Bexly Webhook] Erro ao responder comentário publicamente:', replyErr);
            }

            // 2. Send Private DM to commenter (Official Instagram Graph API Private Reply)
            try {
              const dmUrl = `https://graph.instagram.com/${META_API_VERSION}/${instagramUserId}/messages`;
              const dmRes = await fetch(dmUrl, {
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
              const dmJson = await dmRes.json().catch(() => ({}));
              if (dmRes.ok) {
                console.log(`[Bexly Webhook] Direct enviado com sucesso para o comentário ${commentId}:`, dmJson);
              } else {
                console.warn(`[Bexly Webhook] Falha ao enviar Direct:`, dmJson);
              }
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
