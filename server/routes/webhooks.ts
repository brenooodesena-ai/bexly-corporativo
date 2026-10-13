/**
 * Meta Webhook Router
 *
 * GET  /api/webhooks/meta  — Webhook verification (Challenge-Response)
 * POST /api/webhooks/meta  — Receive webhook events
 *
 * IMPORTANT DESIGN DECISIONS:
 * 1. The POST handler responds 200 immediately (Meta requires < 20s)
 * 2. All processing is async via the event queue
 * 3. Events are stored BEFORE processing for idempotency
 * 4. Signature verification uses HMAC-SHA256 with META_APP_SECRET
 * 5. Duplicate event_ids are detected and skipped
 */
import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { randomUUID } from 'crypto';
import { config } from '../config/index.js';
import { getDb } from '../db/database.js';
import { eventQueue } from '../workers/eventQueue.js';
import { automationEngine, CommentEvent } from '../services/automationEngine.js';
import { logger } from '../utils/logger.js';

export const webhookRouter = Router();

// Register job handler once at module load
eventQueue.register('meta.comment', async (payload) => {
  await automationEngine.processCommentEvent(payload as unknown as CommentEvent);
});

// ── GET /api/webhooks/meta — Webhook Verification ──
// Meta sends a GET with hub.challenge when you configure the webhook.
// We must respond with hub.challenge to verify ownership.
// Reference: https://developers.facebook.com/docs/graph-api/webhooks/getting-started
webhookRouter.get('/meta', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  logger.info({ event: 'webhook_verification_attempt', mode, hasChallenge: !!challenge });

  if (mode === 'subscribe' && token === config.META_VERIFY_TOKEN) {
    logger.info({ event: 'webhook_verified' });
    res.status(200).send(challenge);
  } else {
    logger.warn({ event: 'webhook_verification_failed', mode, tokenMatch: token === config.META_VERIFY_TOKEN });
    res.status(403).json({ error: 'Verification failed' });
  }
});

// ── POST /api/webhooks/meta — Receive Events ──
webhookRouter.post('/meta', (req: Request, res: Response) => {
  // ALWAYS respond 200 first — Meta will retry if we don't respond quickly
  res.status(200).send('EVENT_RECEIVED');

  // Process asynchronously after response
  setImmediate(() => processMetaWebhook(req).catch(err => {
    logger.error({ event: 'webhook_processing_error', error: String(err) });
  }));
});

async function processMetaWebhook(req: Request): Promise<void> {
  // ── Step 1: Verify signature ──
  const rawBody = req.body as Buffer;
  const signature = req.headers['x-hub-signature-256'] as string;

  if (!verifyMetaSignature(rawBody, signature)) {
    logger.warn({ event: 'webhook_invalid_signature' });
    return;
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody.toString());
  } catch {
    logger.error({ event: 'webhook_invalid_json' });
    return;
  }

  logger.info({ event: 'webhook_received', object: payload.object });

  // Meta sends webhooks for Instagram object
  if (payload.object !== 'instagram') {
    logger.info({ event: 'webhook_ignored', reason: 'Not instagram object', object: payload.object });
    return;
  }

  const entries = (payload.entry as Record<string, unknown>[]) || [];

  for (const entry of entries) {
    const db = getDb();
    const instagramUserId = String(entry.id || '');

    // ── FIND CONNECTED ACCOUNT ──
    let account = db.prepare(`
      SELECT id, organization_id, instagram_user_id FROM instagram_accounts WHERE instagram_user_id = ?
    `).get(instagramUserId) as { id: string; organization_id: string; instagram_user_id: string } | undefined;

    if (!account) {
      account = db.prepare(`
        SELECT id, organization_id, instagram_user_id FROM instagram_accounts ORDER BY connected_at DESC LIMIT 1
      `).get() as { id: string; organization_id: string; instagram_user_id: string } | undefined;
    }

    // ── 1. PROCESS DIRECT MESSAGES & STORY REPLIES (entry.messaging) ──
    const messagingList = (entry.messaging as Record<string, unknown>[]) || [];

    for (const msg of messagingList) {
      const sender = msg.sender as { id?: string; username?: string; name?: string } | undefined;
      const message = msg.message as {
        mid?: string;
        text?: string;
        reply_to?: {
          story?: { id?: string; url?: string };
          mid?: string;
        };
        story_share?: {
          link?: string;
          id?: string;
        };
        is_echo?: boolean;
      } | undefined;

      // Ignore echoes (bot's own replies) and empty text messages
      if (!message || message.is_echo || !message.text) continue;

      const storyId = message.reply_to?.story?.id || message.story_share?.id || '';
      const isStoryReply = Boolean(message.reply_to?.story || message.story_share);

      const externalEventId = `ig_msg_${message.mid || msg.timestamp || Date.now()}_${sender?.id || 'anon'}`;

      // Idempotency check
      const existingEvent = db.prepare(`
        SELECT id FROM webhook_events WHERE provider = 'meta' AND external_event_id = ?
      `).get(externalEventId);

      if (existingEvent) {
        logger.info({ event: 'webhook_duplicate_message_ignored', externalEventId });
        continue;
      }

      const eventId = randomUUID();
      db.prepare(`
        INSERT INTO webhook_events (id, organization_id, provider, event_type, external_event_id, payload, status)
        VALUES (?, ?, 'meta', ?, ?, ?, 'pending')
      `).run(
        eventId,
        account?.organization_id || null,
        isStoryReply ? 'instagram.story.replied' : 'instagram.message.received',
        externalEventId,
        JSON.stringify({ entry, msg })
      );

      if (!account) {
        logger.warn({ event: 'webhook_no_account_found_for_message', instagramUserId, externalEventId });
        db.prepare(`UPDATE webhook_events SET status = 'failed', error_message = 'No connected account found' WHERE id = ?`).run(eventId);
        continue;
      }

      const storyEvent: CommentEvent = {
        webhookEventId: eventId,
        organizationId: account.organization_id,
        instagramUserId: account.instagram_user_id || instagramUserId,
        commentId: '', // No commentId for direct messages / story replies
        commentText: String(message.text || ''),
        postId: storyId || (isStoryReply ? 'story_active' : 'direct_message'),
        commenterId: sender?.id,
        commenterUsername: sender?.username || '',
        commenterName: sender?.name || sender?.username || 'Usuário',
        timestamp: String(msg.timestamp || Date.now()),
        eventType: isStoryReply ? 'story_reply' : 'direct_message',
        storyId: storyId || undefined,
      };

      eventQueue.enqueue('meta.comment', storyEvent as unknown as Record<string, unknown>);
      db.prepare(`UPDATE webhook_events SET status = 'processing' WHERE id = ?`).run(eventId);

      logger.info({
        event: isStoryReply ? 'story_reply_enqueued' : 'direct_message_enqueued',
        eventId,
        senderId: sender?.id,
        storyId,
        keyword: message.text,
      });
    }

    // ── 2. PROCESS COMMENTS (entry.changes) ──
    const changes = (entry.changes as Record<string, unknown>[]) || [];

    for (const change of changes) {
      if (change.field !== 'comments' && change.field !== 'live_comments') continue;

      const value = change.value as Record<string, unknown>;
      if (!value) continue;

      // Step 2: Generate unique event ID for idempotency
      const externalEventId = `ig_comment_${value.id || entry.id}_${value.time || Date.now()}`;

      // Step 3: Check idempotency
      const existingEvent = db.prepare(`
        SELECT id, status FROM webhook_events WHERE provider = 'meta' AND external_event_id = ?
      `).get(externalEventId);

      if (existingEvent) {
        logger.info({ event: 'webhook_duplicate_ignored', externalEventId });
        continue;
      }

      // Step 5: Store the raw event
      const eventId = randomUUID();
      db.prepare(`
        INSERT INTO webhook_events (id, organization_id, provider, event_type, external_event_id, payload, status)
        VALUES (?, ?, 'meta', 'instagram.comment.created', ?, ?, 'pending')
      `).run(
        eventId,
        account?.organization_id || null,
        externalEventId,
        JSON.stringify({ entry, change, value })
      );

      if (!account) {
        logger.warn({ event: 'webhook_no_account_found', instagramUserId, externalEventId });
        db.prepare(`UPDATE webhook_events SET status = 'failed', error_message = 'No connected account found' WHERE id = ?`).run(eventId);
        continue;
      }

      // Step 6: Enqueue for async processing
      const commentEvent: CommentEvent = {
        webhookEventId: eventId,
        organizationId: account.organization_id,
        instagramUserId: account.instagram_user_id || instagramUserId,
        commentId: String(value.id || ''),
        commentText: String((value as { text?: string }).text || ''),
        postId: String(((value as { media?: { id?: string } }).media?.id) || (value as any).post_id || ''),
        commenterId: (value as { from?: { id?: string } }).from?.id,
        commenterUsername: (value as { from?: { username?: string } }).from?.username,
        commenterName: (value as { from?: { name?: string } }).from?.name,
        timestamp: String(value.timestamp || new Date().toISOString()),
        eventType: 'comment',
      };

      eventQueue.enqueue('meta.comment', commentEvent as unknown as Record<string, unknown>);

      // Mark event as processing
      db.prepare(`UPDATE webhook_events SET status = 'processing' WHERE id = ?`).run(eventId);
    }
  }
}

/**
 * Verify the X-Hub-Signature-256 header from Meta.
 * Uses HMAC-SHA256 with META_APP_SECRET as the key.
 */
function verifyMetaSignature(rawBody: Buffer, signature: string): boolean {
  if (!config.META_APP_SECRET) {
    logger.warn({ event: 'webhook_signature_skip', reason: 'META_APP_SECRET not configured' });
    return true;
  }

  if (!signature || !signature.startsWith('sha256=')) {
    logger.warn({ event: 'webhook_signature_missing_or_malformed', hasSignature: !!signature });
    return false;
  }

  try {
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', config.META_APP_SECRET)
      .update(rawBody)
      .digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length) {
      logger.warn({ event: 'webhook_signature_length_mismatch' });
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (err) {
    logger.error({ event: 'webhook_signature_verification_error', error: String(err) });
    return false;
  }
}
