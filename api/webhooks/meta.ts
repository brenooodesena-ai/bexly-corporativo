/**
 * Vercel Serverless Function: Meta / Instagram Webhook Handler
 * Endpoint: /api/webhooks/meta
 */
import type { Request, Response } from 'express';

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'bexly_webhook_verify_2025';
const META_API_VERSION = process.env.META_API_VERSION || 'v21.0';

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
    // Meta requires an immediate 200 OK response
    res.status(200).send('EVENT_RECEIVED');

    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!payload || payload.object !== 'instagram') return;

      const entries = Array.isArray(payload.entry) ? payload.entry : [];
      for (const entry of entries) {
        const changes = Array.isArray(entry.changes) ? entry.changes : [];
        for (const change of changes) {
          if (change.field === 'comments') {
            const val = change.value;
            const commentId = val?.id;
            const commentText = (val?.text || '').trim();
            const commenterUsername = val?.from?.username;
            const mediaId = val?.media?.id;

            console.log(`[Bexly Webhook] Comentário recebido de @${commenterUsername}: "${commentText}" no post ${mediaId}`);

            // Access token to reply (configured via env or stored token)
            const token = process.env.META_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;
            if (token && commentId) {
              // 1. Reply publicly to comment
              try {
                await fetch(`https://graph.facebook.com/${META_API_VERSION}/${commentId}/replies`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    message: 'Acabei de te enviar no direct! 🚀 Dá uma olhada lá!',
                  }),
                });
                console.log(`[Bexly Webhook] Resposta pública enviada no comentário ${commentId}`);
              } catch (replyErr) {
                console.warn('[Bexly Webhook] Erro ao responder comentário publicamente:', replyErr);
              }

              // 2. Send Private DM to commenter
              try {
                await fetch(`https://graph.facebook.com/${META_API_VERSION}/me/messages`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    recipient: { comment_id: commentId },
                    message: {
                      text: 'Olá! 👋 Conforme solicitado no comentário, aqui está o seu acesso prioritário da Bexly: https://bexly.com.br',
                    },
                  }),
                });
                console.log(`[Bexly Webhook] Mensagem no Direct enviada para o comentário ${commentId}`);
              } catch (dmErr) {
                console.warn('[Bexly Webhook] Erro ao enviar Direct:', dmErr);
              }
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

