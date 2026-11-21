/**
 * Vercel Serverless Function: Meta / Instagram Webhook Handler
 * Endpoint: /api/webhooks/meta
 *
 * Handles:
 * 1. GET: Meta Webhook Verification (hub.challenge)
 * 2. POST: Comments on Posts/Reels (entry.changes)
 * 3. POST: Story Replies & Direct Messages (entry.messaging)
 */
import type { Request, Response } from 'express';

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'bexly_webhook_verify_2025';
const META_API_VERSION = process.env.META_API_VERSION || 'v21.0';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cltxvvjbukzjktsdrknc.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lypigBq62VpJTg2OzGjahQ_SGho2dlD';

function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[!?,.;:#@'"()[\]{}_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Send an Instagram Direct Message / Private Reply with automatic fallback endpoints
 */
async function sendInstagramMessage(
  targetUserId: string,
  recipient: { comment_id?: string; id?: string },
  messageText: string,
  accessToken: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const endpoints = [
    `https://graph.instagram.com/${META_API_VERSION}/${targetUserId}/messages`,
    `https://graph.instagram.com/${META_API_VERSION}/me/messages`,
    `https://graph.facebook.com/${META_API_VERSION}/${targetUserId}/messages`,
    `https://graph.facebook.com/${META_API_VERSION}/me/messages`,
  ];

  let lastErr: any = null;

  for (const url of endpoints) {
    try {
      const fullUrl = `${url}?access_token=${encodeURIComponent(accessToken)}`;
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipient,
          message: { text: messageText },
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && (json.message_id || json.recipient_id)) {
        console.log(`[Bexly Webhook] DM enviada com sucesso via ${url}:`, json);
        return { success: true, data: json };
      } else {
        lastErr = json?.error?.message || JSON.stringify(json);
        console.warn(`[Bexly Webhook] Falha ao enviar DM via ${url}:`, json);
      }
    } catch (e: any) {
      lastErr = e.message;
      console.warn(`[Bexly Webhook] Erro de rede ao chamar ${url}:`, e);
    }
  }

  return { success: false, error: lastErr };
}

/**
 * Send a Public Reply to an Instagram comment with fallback endpoints
 */
async function sendPublicCommentReply(
  commentId: string,
  replyText: string,
  accessToken: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const endpoints = [
    `https://graph.instagram.com/${META_API_VERSION}/${commentId}/replies`,
    `https://graph.facebook.com/${META_API_VERSION}/${commentId}/replies`,
  ];

  let lastErr: any = null;

  for (const url of endpoints) {
    try {
      const fullUrl = `${url}?access_token=${encodeURIComponent(accessToken)}`;
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: replyText }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.id) {
        console.log(`[Bexly Webhook] Resposta pública enviada no comentário ${commentId} via ${url}:`, json);
        return { success: true, data: json };
      } else {
        lastErr = json?.error?.message || JSON.stringify(json);
        console.warn(`[Bexly Webhook] Falha na resposta pública via ${url}:`, json);
      }
    } catch (e: any) {
      lastErr = e.message;
    }
  }

  return { success: false, error: lastErr };
}

export default async function handler(req: Request, res: Response) {
  // ── 1. GET: Webhook Verification from Meta ──
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('[Bexly Webhook] Tentativa de verificação GET:', { mode, tokenMatch: token === VERIFY_TOKEN });

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Bexly Webhook] Verificado com sucesso pela Meta!');
      return res.status(200).send(challenge);
    } else {
      console.warn('[Bexly Webhook] Falha na verificação de token:', { mode, tokenMatch: token === VERIFY_TOKEN });
      return res.status(403).send('Verification failed');
    }
  }

  // ── 2. POST: Event Notification (Comments, Story Replies, DMs) ──
  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      console.log('[Bexly Webhook] Payload recebido da Meta:', JSON.stringify(payload).substring(0, 300));

      if (!payload || (payload.object !== 'instagram' && payload.object !== 'page')) {
        console.log('[Bexly Webhook] Objeto ignorado (não é instagram nem page):', payload?.object);
        return res.status(200).send('EVENT_RECEIVED');
      }

      const entries = Array.isArray(payload.entry) ? payload.entry : [];

      for (const entry of entries) {
        const instagramUserId = String(entry.id || '');
        const changes = Array.isArray(entry.changes) ? entry.changes : [];
        const messagingList = Array.isArray(entry.messaging) ? entry.messaging : [];

        // 1. Fetch user token and automation rules from Supabase
        let token = process.env.META_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN || '';
        let automations: any[] = [];
        let matchedRowId: string | null = null;

        try {
          const supaRes = await fetch(
            `${SUPABASE_URL}/rest/v1/bexly_automations?select=*&order=updated_at.desc&limit=10`,
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
              matchedRowId = matchedRow.id;
              if (matchedRow.access_token) token = matchedRow.access_token;
              if (Array.isArray(matchedRow.rules)) automations = matchedRow.rules;
              console.log(`[Bexly Webhook] Regras carregadas do Supabase para @${matchedRow.username}: ${automations.length} regras ativas`);
            }
          }
        } catch (supaErr) {
          console.warn('[Bexly Webhook] Erro ao consultar Supabase:', supaErr);
        }

        if (!token) {
          console.warn('[Bexly Webhook] Nenhum access_token disponível para responder.');
          continue;
        }

        // ── FLUXO A: COMENTÁRIOS EM POSTS E REELS (entry.changes) ──
        for (const change of changes) {
          if (change.field === 'comments' || change.field === 'live_comments') {
            const val = change.value;
            const commentId = String(val?.id || '');
            const commentText = (val?.text || '').trim();
            const commenterUsername = val?.from?.username || 'amigo';
            const commenterId = String(val?.from?.id || '');
            const mediaId = String(val?.media?.id || (val as any)?.post_id || '');

            console.log(`[Bexly Webhook] Comentário recebido de @${commenterUsername} (${commenterId}) no post ${mediaId}: "${commentText}"`);

            if (!commentId) continue;

            const isSelfComment = Boolean(commenterId && commenterId === instagramUserId);
            if (isSelfComment) {
              console.log(`[Bexly Webhook] Comentário do próprio dono da conta (@${commenterUsername}). DM requer conta diferente, mas prosseguindo com resposta pública.`);
            }

            const cleanComment = normalizeText(commentText);

            // Procura regra correspondente
            let matchedRule: any = null;
            if (automations.length > 0) {
              matchedRule = automations.find((a: any) => {
                if (a.status !== 'active') return false;

                const conditions = Array.isArray(a.conditions) ? a.conditions : [];

                // Se não há condições definidas, aceita qualquer comentário
                let keywordMatches = conditions.length === 0;
                if (!keywordMatches) {
                  keywordMatches = conditions.some((cond: any) => {
                    const rawKw = (cond.keyword || cond.value || '').trim();
                    if (!rawKw) return true; // sem palavra-chave específica = qualquer
                    const cleanKw = normalizeText(rawKw);
                    const op = cond.operator || 'contains';
                    if (op === 'exact') return cleanComment === cleanKw;
                    return cleanComment.includes(cleanKw);
                  });
                }

                if (!keywordMatches) return false;

                const targetPost = String(a.trigger?.postId || a.trigger?.post_id || 'all');
                return targetPost === 'all' || !mediaId || targetPost === mediaId || mediaId.includes(targetPost) || targetPost.includes(mediaId) || automations.length === 1;
              });
            }

            // Mensagens padrão caso não haja automação ou regra customizada
            let publicReplyText = 'Acabei de te enviar no direct! 🚀 Dá uma olhada lá!';
            let dmText = `Olá, @${commenterUsername}! 👋 Conforme solicitado no comentário, aqui está o seu acesso prioritário da Bexly: https://bexly.com.br/acesso-vip`;

            if (matchedRule) {
              console.log(`[Bexly Webhook] Regra correspondida: "${matchedRule.name}" para comentário "${commentText}"`);
              const action = matchedRule.actions?.[0];
              if (action) {
                // Resposta pública configurada
                if (action.publicCommentReply?.enabled && Array.isArray(action.publicCommentReply?.replyTemplates) && action.publicCommentReply.replyTemplates.length > 0) {
                  publicReplyText = action.publicCommentReply.replyTemplates[0];
                } else if (action.config?.replyMessage) {
                  publicReplyText = action.config.replyMessage;
                }

                // Template do Direct
                const rawTemplate = action.messageTemplate || action.config?.dmMessage || action.config?.message_template || dmText;
                const ctaUrl = action.ctaButton?.url || action.config?.link || 'https://bexly.com.br';
                dmText = rawTemplate
                  .replace(/\{\{nome\}\}/gi, `@${commenterUsername}`)
                  .replace(/\{\{name\}\}/gi, `@${commenterUsername}`)
                  .replace(/\{\{username\}\}/gi, `@${commenterUsername}`)
                  .replace(/\{\{link\}\}/gi, ctaUrl);
              }
            } else {
              console.log(`[Bexly Webhook] Nenhuma regra específica filtrada para o post ${mediaId}. Usando disparo automático.`);
            }

            // 1. Envia Resposta Pública no Comentário
            const publicRes = await sendPublicCommentReply(commentId, publicReplyText, token);
            if (publicRes.success) {
              console.log(`[Bexly Webhook] Resposta pública postada com sucesso no comentário ${commentId}`);
            }

            // 2. Envia Private Reply / Direct Message (se não for a própria conta)
            let dmRes: { success: boolean; data?: any; error?: string } = { success: false, error: 'Self comment' };
            if (!isSelfComment) {
              // Tenta primeiro via comment_id (API oficial de Private Reply)
              dmRes = await sendInstagramMessage(
                instagramUserId,
                { comment_id: commentId },
                dmText,
                token
              );

              // Se falhar via comment_id e tivermos o commenterId (IGSID), tenta direto via ID
              if (!dmRes.success && commenterId) {
                console.log(`[Bexly Webhook] Tentando envio direto para IGSID @${commenterUsername} (${commenterId})...`);
                dmRes = await sendInstagramMessage(
                  instagramUserId,
                  { id: commenterId },
                  dmText,
                  token
                );
              }
            }

            // 3. Atualiza Métricas e Auditoria no Supabase
            if (matchedRowId) {
              try {
                const targetRuleId = matchedRule?.id || automations[0]?.id;
                const updatedRules = automations.map((r: any) => {
                  if (r.id === targetRuleId) {
                    const metrics = r.metrics || {};
                    return {
                      ...r,
                      metrics: {
                        ...metrics,
                        commentsDetected: (metrics.commentsDetected || 0) + 1,
                        dmsSent: dmRes.success ? (metrics.dmsSent || 0) + 1 : (metrics.dmsSent || 0),
                        keywordMatches: (metrics.keywordMatches || 0) + 1,
                        lastWebhookLog: {
                          timestamp: new Date().toISOString(),
                          sender: `@${commenterUsername}`,
                          senderId: commenterId,
                          comment: commentText,
                          mediaId,
                          rule: r.name,
                          publicReply: publicRes.success ? 'Enviada' : (publicRes.error || 'Falha'),
                          dm: isSelfComment
                            ? 'Aviso: Comentário feito pela própria conta dona do post. O Instagram proíbe envio de Direct para si mesmo. Teste com outra conta.'
                            : (dmRes.success ? 'Enviada' : (dmRes.error || 'Falha')),
                        },
                      },
                    };
                  }
                  return r;
                });

                await fetch(`${SUPABASE_URL}/rest/v1/bexly_automations?id=eq.${matchedRowId}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                  },
                  body: JSON.stringify({
                    rules: updatedRules,
                    updated_at: new Date().toISOString(),
                  }),
                });
                console.log('[Bexly Webhook] Auditoria e métricas salvas com sucesso no Supabase.');
              } catch (metricErr) {
                console.warn('[Bexly Webhook] Erro ao atualizar métricas no Supabase:', metricErr);
              }
            }
          }
        }

        // ── FLUXO B: RESPOSTAS A STORIES E DIRECT MESSAGES (entry.messaging) ──
        for (const msgItem of messagingList) {
          const senderId = String(msgItem.sender?.id || '');
          const messageObj = msgItem.message;

          // Ignora mensagens enviadas pela própria página/bot (echoes) ou sem texto
          if (!messageObj || messageObj.is_echo || !messageObj.text) continue;

          // Ignora se for o próprio bot
          if (senderId === instagramUserId) continue;

          const incomingText = String(messageObj.text || '').trim();
          const cleanText = normalizeText(incomingText);
          const isStoryReply = Boolean(messageObj.reply_to?.story || messageObj.story_share);
          const storyId = messageObj.reply_to?.story?.id || messageObj.story_share?.id || '';

          console.log(`[Bexly Webhook] Mensagem direta/Story recebida de ${senderId}: "${incomingText}" (isStoryReply: ${isStoryReply})`);

          // Procura regra de automação correspondente
          let matchedRule: any = null;
          if (automations.length > 0) {
            matchedRule = automations.find((a: any) => {
              if (a.status !== 'active') return false;

              // Se for story reply, prioriza regras configuradas para Story
              if (isStoryReply) {
                const triggerType = a.trigger?.type || '';
                const isStoryConfig = triggerType === 'instagram_story_reply' || a.trigger?.mediaType === 'STORY';
                if (!isStoryConfig && automations.length > 1) return false;
              }

              const conditions = Array.isArray(a.conditions) ? a.conditions : [];
              let keywordMatches = conditions.length === 0;
              if (!keywordMatches) {
                keywordMatches = conditions.some((cond: any) => {
                  const rawKw = (cond.keyword || cond.value || '').trim();
                  if (!rawKw) return true;
                  const cleanKw = normalizeText(rawKw);
                  const op = cond.operator || 'contains';
                  if (op === 'exact') return cleanText === cleanKw;
                  return cleanText.includes(cleanKw);
                });
              }

              return keywordMatches;
            });
          }

          let dmText = `Olá! 👋 Vi sua mensagem sobre o Bexly. Aqui está o seu link prioritário: https://bexly.com.br/acesso-vip`;

          if (matchedRule) {
            console.log(`[Bexly Webhook] Regra correspondida para mensagem de ${senderId}: "${matchedRule.name}"`);
            const action = matchedRule.actions?.[0];
            if (action) {
              const rawTemplate = action.messageTemplate || action.config?.dmMessage || action.config?.message_template || dmText;
              const ctaUrl = action.ctaButton?.url || action.config?.link || 'https://bexly.com.br';
              dmText = rawTemplate
                .replace(/\{\{nome\}\}/gi, 'você')
                .replace(/\{\{name\}\}/gi, 'você')
                .replace(/\{\{link\}\}/gi, ctaUrl);
            }
          }

          // Envia DM em resposta ao Story / Mensagem usando o IGSID do remetente
          const dmRes = await sendInstagramMessage(
            instagramUserId,
            { id: senderId },
            dmText,
            token
          );

          if (dmRes.success) {
            console.log(`[Bexly Webhook] Resposta de Direct/Story enviada com sucesso para ${senderId}`);
          }
        }
      }
    } catch (err: any) {
      console.error('[Bexly Webhook] Erro crítico no processamento do webhook:', err);
    }

    // Retorna 200 OK para a Meta após a conclusão das operações assíncronas
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
