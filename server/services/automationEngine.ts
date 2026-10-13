/**
 * Automation Engine
 *
 * Generic, extensible engine that processes Events through Triggers → Conditions → Actions.
 *
 * Designed to be channel-agnostic. Currently supports Instagram triggers,
 * but the architecture allows adding WhatsApp, TikTok, Email, etc. in the future.
 *
 * Trigger types (current):
 *   - instagram.comment.created
 *
 * Action types (current):
 *   - instagram.send_private_reply  (official Meta API)
 *   - lead.upsert
 *   - lead.add_tag
 *   - campaign.record_touch
 *
 * Condition operators:
 *   - contains, exact, not_contains, starts_with
 */
import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';
import { decryptToken } from './tokenEncryption.js';
import { sendPrivateReply, sendDirectMessage, replyPublicComment } from './metaApiClient.js';
import { leadService } from './leadService.js';
import { logger } from '../utils/logger.js';

// ── Types ──

export interface TriggerConfig {
  type: 'instagram.comment.created' | 'instagram_comment' | 'instagram_story_reply';
  post_id: string | 'all';  // 'all' = any post
  post_title?: string;
}

export interface ConditionConfig {
  field: 'comment_text';
  operator: 'contains' | 'exact' | 'not_contains' | 'starts_with';
  value: string;
  case_sensitive?: boolean;
}

export interface ActionConfig {
  type:
    | 'instagram.send_private_reply'
    | 'send_instagram_dm'
    | 'instagram.reply_public_comment'
    | 'lead.upsert'
    | 'lead.add_tag'
    | 'campaign.record_touch';
  config: Record<string, unknown>;
}

export interface AutomationRecord {
  id: string;
  organization_id: string;
  instagram_account_id: string;
  campaign_id?: string;
  name: string;
  status: 'active' | 'paused' | 'archived';
  trigger_config: string;  // JSON
  conditions_config: string;  // JSON
  actions_config: string;  // JSON
}

export interface CommentEvent {
  webhookEventId: string;
  organizationId: string;
  instagramUserId: string;
  commentId: string;
  commentText: string;
  postId: string;
  commenterId?: string;  // IG-scoped user ID of commenter (essential for DMs and Story replies)
  commenterUsername?: string;
  commenterName?: string;
  timestamp: string;
  eventType?: 'comment' | 'story_reply' | 'direct_message';
  storyId?: string;
}

interface RunLogEntry {
  step: string;
  status: 'ok' | 'skip' | 'error' | 'warn';
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

// ── Engine ──

export const automationEngine = {
  /**
   * Process a comment event against all active automations for the given org+account.
   * This is the main entry point called by the webhook processor.
   */
  async processCommentEvent(event: CommentEvent): Promise<void> {
    const db = getDb();
    const runLog: RunLogEntry[] = [];

    const log = (step: string, status: RunLogEntry['status'], message: string, data?: Record<string, unknown>) => {
      const entry: RunLogEntry = { step, status, message, data, timestamp: new Date().toISOString() };
      runLog.push(entry);
      logger.info({ event: 'automation_step', ...entry });
    };

    log('trigger', 'ok', `Comment event received: "${event.commentText.substring(0, 50)}"`, {
      commentId: event.commentId,
      postId: event.postId,
    });

    // Find all active automations for this account with robust fallback
    let automations = db.prepare(`
      SELECT a.* FROM automations a
      INNER JOIN instagram_accounts ia ON ia.id = a.instagram_account_id
      WHERE (ia.instagram_user_id = ? OR ia.id = ? OR a.instagram_account_id = ?)
        AND a.status = 'active'
    `).all(event.instagramUserId, event.instagramUserId, event.instagramUserId) as AutomationRecord[];

    if (automations.length === 0) {
      automations = db.prepare(`
        SELECT a.* FROM automations a
        WHERE a.organization_id = ? AND a.status = 'active'
      `).all(event.organizationId) as AutomationRecord[];
    }

    if (automations.length === 0) {
      automations = db.prepare(`
        SELECT a.* FROM automations a
        WHERE a.status = 'active'
      `).all() as AutomationRecord[];
    }

    if (automations.length === 0) {
      log('lookup', 'skip', 'No active automations found for this account');
      return;
    }

    for (const automation of automations) {
      await this._runAutomation(automation, event, runLog, log);
    }
  },

  async _runAutomation(
    automation: AutomationRecord,
    event: CommentEvent,
    runLog: RunLogEntry[],
    log: (step: string, status: RunLogEntry['status'], message: string, data?: Record<string, unknown>) => void
  ): Promise<void> {
    const db = getDb();
    const runId = randomUUID();

    // Create run record
    db.prepare(`
      INSERT INTO automation_runs (id, organization_id, automation_id, webhook_event_id, status, run_log)
      VALUES (?, ?, ?, ?, 'running', '[]')
    `).run(runId, automation.organization_id, automation.id, event.webhookEventId);

    try {
      const trigger: TriggerConfig = JSON.parse(automation.trigger_config);
      const conditions: ConditionConfig[] = JSON.parse(automation.conditions_config);
      const actions: ActionConfig[] = JSON.parse(automation.actions_config);

      // ── Step 1: Evaluate trigger ──
      const triggerMatches = this._evaluateTrigger(trigger, event);
      log('trigger_eval', triggerMatches ? 'ok' : 'skip',
        triggerMatches ? `Trigger matched (post: ${trigger.post_id || 'all'})` : `Trigger did not match (post: ${trigger.post_id} vs event: ${event.postId})`
      );

      if (!triggerMatches) {
        this._finalizeRun(runId, 'skipped', runLog);
        return;
      }

      // ── Step 2: Evaluate conditions ──
      const conditionResult = this._evaluateConditions(conditions, event, trigger);
      log('condition_eval', conditionResult.matched ? 'ok' : 'skip',
        conditionResult.matched
          ? `Condition matched: keyword "${conditionResult.matchedKeyword}"`
          : `Condition not matched: "${event.commentText.substring(0, 30)}"`
      );

      if (!conditionResult.matched) {
        this._finalizeRun(runId, 'skipped', runLog);
        // Update metrics
        db.prepare(`UPDATE automations SET total_triggers = total_triggers + 1 WHERE id = ?`).run(automation.id);
        return;
      }

      // ── Step 3: Execute actions ──
      let leadId: string | undefined;

      for (const action of actions) {
        const actionResult = await this._executeAction(action, automation, event, runId, leadId, conditionResult.matchedKeyword);
        log('action', actionResult.success ? 'ok' : 'error',
          actionResult.message,
          actionResult.data
        );

        if (action.type === 'lead.upsert' && actionResult.leadId) {
          leadId = actionResult.leadId;
        }
      }

      // Update metrics
      db.prepare(`
        UPDATE automations SET
          total_triggers = total_triggers + 1,
          total_matches = total_matches + 1,
          total_actions_executed = total_actions_executed + 1
        WHERE id = ?
      `).run(automation.id);

      // Update run
      this._finalizeRun(runId, 'completed', runLog, leadId);

    } catch (err) {
      log('error', 'error', String(err));
      this._finalizeRun(runId, 'failed', runLog, undefined, String(err));

      db.prepare(`
        UPDATE automations SET total_actions_failed = total_actions_failed + 1 WHERE id = ?
      `).run(automation.id);
    }
  },

  _evaluateTrigger(trigger: TriggerConfig, event: CommentEvent): boolean {
    const triggerType = trigger.type || (trigger as any)?.type;
    if (
      triggerType !== 'instagram.comment.created' &&
      triggerType !== 'instagram_comment' &&
      triggerType !== 'instagram_story_reply'
    ) {
      return false;
    }

    const triggerPostId = trigger.post_id || (trigger as any)?.postId || 'all';

    // 'all' = any post or any story
    if (!triggerPostId || triggerPostId === 'all') {
      return true;
    }

    // Direct ID match (post ID, media ID, or story ID)
    if (triggerPostId === event.postId || (event.storyId && triggerPostId === event.storyId)) {
      return true;
    }

    // If it's a story reply event and the automation is set for stories
    if (
      event.eventType === 'story_reply' &&
      (triggerType === 'instagram_story_reply' || (trigger as any)?.mediaType === 'STORY' || String(triggerPostId).includes('story'))
    ) {
      return true;
    }

    // If triggerPostId is an Instagram URL (e.g. https://www.instagram.com/p/DFxyz/ or /reel/XYZ/)
    if (typeof triggerPostId === 'string' && (triggerPostId.includes('/p/') || triggerPostId.includes('/reel/') || triggerPostId.includes('instagram.com'))) {
      const match = triggerPostId.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
      const shortcode = match ? match[1] : null;

      if (shortcode) {
        if (event.postId === shortcode) return true;
        if (triggerPostId.includes(event.postId)) return true;
      }
      return true;
    }

    return false;
  },

  _evaluateConditions(
    conditions: ConditionConfig[],
    event: CommentEvent,
    trigger?: TriggerConfig
  ): {
    matched: boolean;
    matchedKeyword?: string;
  } {
    const normComment = normalizeText(event.commentText);

    // Check trigger-level keywords (used by modern UI and story replies)
    const triggerKeywords = (trigger as any)?.keywords || ((trigger as any)?.keyword ? [(trigger as any).keyword] : []);
    if (Array.isArray(triggerKeywords) && triggerKeywords.length > 0) {
      for (const rawKw of triggerKeywords) {
        if (!rawKw) continue;
        const normKw = normalizeText(String(rawKw));
        if (normComment.includes(normKw)) {
          return { matched: true, matchedKeyword: String(rawKw) };
        }
      }
      return { matched: false };
    }

    if (!conditions || conditions.length === 0) {
      return { matched: true, matchedKeyword: 'TODAS' };
    }

    for (const condition of conditions) {
      const rawValue = condition.value || (condition as any).keyword || '';
      if (!rawValue) continue;

      const normValue = normalizeText(rawValue);
      let matched = false;
      const op = condition.operator || 'contains';

      switch (op) {
        case 'contains':
          matched = normComment.includes(normValue);
          break;
        case 'exact':
          matched = normComment === normValue;
          break;
        case 'not_contains':
          matched = !normComment.includes(normValue);
          break;
        case 'starts_with':
          matched = normComment.startsWith(normValue);
          break;
        default:
          matched = normComment.includes(normValue);
          break;
      }

      if (matched) return { matched: true, matchedKeyword: rawValue };
    }
    return { matched: false };
  },

  async _executeAction(
    action: ActionConfig,
    automation: AutomationRecord,
    event: CommentEvent,
    runId: string,
    existingLeadId?: string,
    matchedKeyword?: string
  ): Promise<{ success: boolean; message: string; leadId?: string; data?: Record<string, unknown> }> {
    const db = getDb();
    const actionType = action.type || (action as any).type;

    switch (actionType) {
      case 'lead.upsert': {
        const lead = await leadService.upsert({
          organizationId: automation.organization_id,
          instagramUserId: event.commenterId,
          instagramUsername: event.commenterUsername,
          name: event.commenterName,
          sourcePostId: event.postId,
          campaignId: automation.campaign_id,
          keyword: matchedKeyword,
          automationId: automation.id,
          commentId: event.commentId,
        });

        // Update run with leadId
        db.prepare(`UPDATE automation_runs SET lead_id = ? WHERE id = ?`).run(lead.id, runId);

        return {
          success: true,
          message: `Lead upserted: ${lead.id} (${lead.isNew ? 'new' : 'existing'})`,
          leadId: lead.id,
          data: { leadId: lead.id, isNew: lead.isNew },
        };
      }

      case 'instagram.send_private_reply':
      case 'send_instagram_dm': {
        // Fetch the Instagram account token
        let account = db.prepare(`
          SELECT id, access_token_encrypted, instagram_user_id FROM instagram_accounts
          WHERE id = ? AND organization_id = ?
        `).get(automation.instagram_account_id, automation.organization_id) as { id: string; access_token_encrypted: string; instagram_user_id: string } | undefined;

        if (!account) {
          account = db.prepare(`
            SELECT id, access_token_encrypted, instagram_user_id FROM instagram_accounts
            WHERE organization_id = ? LIMIT 1
          `).get(automation.organization_id) as any;
        }

        if (!account) {
          return { success: false, message: 'Instagram account not found or not authorized' };
        }

        let accessToken: string;
        try {
          accessToken = decryptToken(account.access_token_encrypted);
        } catch {
          return { success: false, message: 'Failed to decrypt access token — account may need reconnection' };
        }

        const messageTemplate =
          (action as any).messageTemplate ||
          (action.config?.message_template as string) ||
          (action.config?.messageTemplate as string) ||
          '';

        const ctaUrl =
          (action as any).ctaButton?.url ||
          (action.config?.ctaButton as any)?.url ||
          (action.config?.link as string) ||
          '';

        const ctaText =
          (action as any).ctaButton?.text ||
          (action.config?.ctaButton as any)?.text ||
          'Acessar';

        let personalizedMessage = personalizeMessage(messageTemplate, {
          name: event.commenterName || event.commenterUsername || 'você',
          username: event.commenterUsername || '',
          keyword: matchedKeyword || '',
          link: ctaUrl,
        });

        if (ctaUrl && !personalizedMessage.includes(ctaUrl)) {
          personalizedMessage += `\n\n👉 ${ctaText}: ${ctaUrl}`;
        }

        const targetUserId = event.instagramUserId || account.instagram_user_id;
        const isStoryOrDm = event.eventType === 'story_reply' || event.eventType === 'direct_message' || (!event.commentId && Boolean(event.commenterId));

        let result: { success: boolean; messageId?: string; errorCode?: string; errorMessage?: string; isRetryable?: boolean; isPermanent?: boolean };

        if (isStoryOrDm && event.commenterId) {
          // Send Direct Message using user's IGSID
          result = await sendDirectMessage(
            targetUserId,
            event.commenterId,
            personalizedMessage,
            accessToken
          );
        } else {
          // Send Private Reply to post comment
          result = await sendPrivateReply(
            targetUserId,
            event.commentId,
            personalizedMessage,
            accessToken
          );

          // If private reply failed because comment_id was not valid or not found, but we have commenterId, fallback to sendDirectMessage
          if (!result.success && event.commenterId) {
            const fallbackResult = await sendDirectMessage(
              targetUserId,
              event.commenterId,
              personalizedMessage,
              accessToken
            );
            if (fallbackResult.success) {
              result = fallbackResult;
            }
          }
        }

        // Only execute public comment reply if it is a real post comment (Stories do NOT have public comments)
        const publicReplyConfig = (action as any).publicCommentReply || (action.config?.publicCommentReply as any);
        if (!isStoryOrDm && publicReplyConfig?.enabled && Array.isArray(publicReplyConfig.replyTemplates) && publicReplyConfig.replyTemplates.length > 0 && event.commentId) {
          try {
            const rawPublic = publicReplyConfig.replyTemplates[0];
            const publicReplyText = rawPublic
              .replace(/\{\{nome\}\}/gi, event.commenterName || event.commenterUsername || 'você')
              .replace(/\{\{username\}\}/gi, event.commenterUsername ? `@${event.commenterUsername}` : '');
            await replyPublicComment(event.commentId, publicReplyText, accessToken);
          } catch (pubErr) {
            logger.warn({ event: 'public_reply_error', error: String(pubErr) });
          }
        }

        // Log message attempt
        db.prepare(`
          INSERT INTO message_attempts (
            id, organization_id, automation_run_id, lead_id,
            instagram_account_id, comment_id, message_text,
            status, meta_message_id, error_code, error_message, is_retryable
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          randomUUID(),
          automation.organization_id,
          runId,
          existingLeadId || null,
          automation.instagram_account_id,
          event.commentId,
          personalizedMessage,
          result.success ? 'sent' : (result.isPermanent ? 'permanent_error' : 'failed'),
          result.success ? result.messageId : null,
          result.success ? null : result.errorCode,
          result.success ? null : result.errorMessage,
          result.success ? 0 : (result.isRetryable ? 1 : 0)
        );

        if (result.success) {
          return {
            success: true,
            message: `Private reply sent successfully. Meta message_id: ${result.messageId}`,
            data: { messageId: result.messageId },
          };
        } else {
          return {
            success: false,
            message: `Failed to send private reply: ${result.errorMessage} (code: ${result.errorCode})`,
            data: { errorCode: result.errorCode, isRetryable: result.isRetryable },
          };
        }
      }

      case 'instagram.reply_public_comment': {
        const account = db.prepare(`
          SELECT access_token_encrypted FROM instagram_accounts
          WHERE id = ? AND organization_id = ?
        `).get(automation.instagram_account_id, automation.organization_id) as { access_token_encrypted: string } | undefined;

        if (!account) {
          return { success: false, message: 'Instagram account not found or not authorized' };
        }

        let accessToken: string;
        try {
          accessToken = decryptToken(account.access_token_encrypted);
        } catch {
          return { success: false, message: 'Failed to decrypt access token' };
        }

        const templates = (action.config.reply_templates as string[]) ||
                          (action.config.reply_text ? [action.config.reply_text as string] : []);
        const chosenTemplate = templates.length > 0
          ? templates[Math.floor(Math.random() * templates.length)]
          : 'Acabei de te responder no Direct! 🚀 Confere lá!';

        const replyMessage = personalizeMessage(chosenTemplate, {
          name: event.commenterName || event.commenterUsername || 'você',
          username: event.commenterUsername || '',
          keyword: matchedKeyword || '',
        });

        const replyRes = await replyPublicComment(event.commentId, replyMessage, accessToken);
        if (replyRes.success) {
          return {
            success: true,
            message: `Public reply posted to comment. Reply ID: ${replyRes.replyId}`,
            data: { replyId: replyRes.replyId },
          };
        } else {
          return {
            success: false,
            message: `Failed to post public reply: ${replyRes.error}`,
          };
        }
      }

      case 'lead.add_tag': {
        if (existingLeadId) {
          const tagName = ((action.config.tag_name || action.config.tag) as string)?.trim();
          if (tagName) {
            await leadService.addTag(automation.organization_id, existingLeadId, tagName);
            return { success: true, message: `Tag "${tagName}" added to lead` };
          }
          return { success: false, message: 'Tag name is empty or missing' };
        }
        return { success: false, message: 'No lead to add tag to (lead.upsert must run first)' };
      }

      case 'campaign.record_touch': {
        if (existingLeadId && automation.campaign_id) {
          await leadService.recordTouchpoint({
            organizationId: automation.organization_id,
            leadId: existingLeadId,
            campaignId: automation.campaign_id,
            contentId: event.postId,
            platform: 'instagram',
            keyword: matchedKeyword,
          });
          return { success: true, message: `Touchpoint recorded for campaign ${automation.campaign_id}` };
        }
        return { success: false, message: 'Missing leadId or campaignId for touchpoint recording' };
      }

      default:
        return { success: false, message: `Unknown action type: ${action.type}` };
    }
  },

  _finalizeRun(
    runId: string,
    status: 'completed' | 'failed' | 'skipped',
    runLog: RunLogEntry[],
    leadId?: string,
    errorMessage?: string
  ): void {
    const db = getDb();
    db.prepare(`
      UPDATE automation_runs SET
        status = ?,
        finished_at = datetime('now'),
        run_log = ?,
        lead_id = COALESCE(?, lead_id),
        error_message = ?
      WHERE id = ?
    `).run(status, JSON.stringify(runLog), leadId || null, errorMessage || null, runId);
  },
};

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

function personalizeMessage(template: string, vars: Record<string, string>): string {
  return template
    .replace(/\{\{nome\}\}/gi, vars.name || '')
    .replace(/\{\{name\}\}/gi, vars.name || '')
    .replace(/\{\{username\}\}/gi, vars.username ? `@${vars.username}` : '')
    .replace(/\{\{palavra_chave\}\}/gi, vars.keyword || '')
    .replace(/\{\{keyword\}\}/gi, vars.keyword || '')
    .replace(/\{\{link\}\}/gi, vars.link || '');
}
