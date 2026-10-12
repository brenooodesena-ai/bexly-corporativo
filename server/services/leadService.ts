/**
 * Lead Service — Native Lead Management
 *
 * No external CRM dependency.
 * Handles creation, deduplication, tagging, timeline, and attribution.
 */
import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';
import { logger } from '../utils/logger.js';

interface UpsertLeadInput {
  organizationId: string;
  instagramUserId?: string;
  instagramUsername?: string;
  name?: string;
  sourcePostId?: string;
  campaignId?: string;
  keyword?: string;
  automationId?: string;
  commentId?: string;
}

interface UpsertLeadResult {
  id: string;
  isNew: boolean;
}

interface RecordTouchpointInput {
  organizationId: string;
  leadId: string;
  campaignId?: string;
  contentId?: string;
  platform: string;
  keyword?: string;
}

export const leadService = {
  /**
   * Create or update a lead.
   * Deduplication logic:
   *   1. If instagramUserId matches (official IG-scoped ID) → use that lead
   *   2. Else if instagramUsername matches → use that lead
   *   3. Otherwise → create new lead
   */
  async upsert(input: UpsertLeadInput): Promise<UpsertLeadResult> {
    const db = getDb();
    const now = new Date().toISOString();

    // Try to find existing lead
    let existing: { id: string } | undefined;

    if (input.instagramUserId) {
      existing = db.prepare(`
        SELECT id FROM leads
        WHERE organization_id = ? AND instagram_user_id = ?
        LIMIT 1
      `).get(input.organizationId, input.instagramUserId) as { id: string } | undefined;
    }

    if (!existing && input.instagramUsername) {
      existing = db.prepare(`
        SELECT id FROM leads
        WHERE organization_id = ? AND instagram_username = ?
        LIMIT 1
      `).get(input.organizationId, input.instagramUsername.toLowerCase()) as { id: string } | undefined;
    }

    if (existing) {
      // Update last_touch and any new info
      db.prepare(`
        UPDATE leads SET
          last_touch_at = ?,
          instagram_user_id = COALESCE(instagram_user_id, ?),
          instagram_username = COALESCE(instagram_username, ?),
          name = COALESCE(name, ?),
          updated_at = ?
        WHERE id = ?
      `).run(now, input.instagramUserId || null, input.instagramUsername?.toLowerCase() || null, input.name || null, now, existing.id);

      // Record interaction
      this._recordInteraction({
        organizationId: input.organizationId,
        leadId: existing.id,
        type: 'comment_detected',
        externalId: input.commentId,
        contentId: input.sourcePostId,
        campaignId: input.campaignId,
        keyword: input.keyword,
      });

      logger.info({ event: 'lead_updated', leadId: existing.id, org: input.organizationId });
      return { id: existing.id, isNew: false };
    }

    // Create new lead
    const leadId = randomUUID();

    db.prepare(`
      INSERT INTO leads (
        id, organization_id, name, instagram_username, instagram_user_id,
        source, source_platform, status, first_touch_at, last_touch_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'instagram', 'instagram', 'novo', ?, ?, ?, ?)
    `).run(
      leadId,
      input.organizationId,
      input.name || null,
      input.instagramUsername?.toLowerCase() || null,
      input.instagramUserId || null,
      now, now, now, now
    );

    // Record first interaction
    this._recordInteraction({
      organizationId: input.organizationId,
      leadId,
      type: 'comment_detected',
      externalId: input.commentId,
      contentId: input.sourcePostId,
      campaignId: input.campaignId,
      keyword: input.keyword,
    });

    // Record first touch for attribution
    this.recordTouchpoint({
      organizationId: input.organizationId,
      leadId,
      campaignId: input.campaignId,
      contentId: input.sourcePostId,
      platform: 'instagram',
      keyword: input.keyword,
    });

    logger.info({ event: 'lead_created', leadId, org: input.organizationId });
    return { id: leadId, isNew: true };
  },

  _recordInteraction(input: {
    organizationId: string;
    leadId: string;
    type: string;
    externalId?: string;
    contentId?: string;
    campaignId?: string;
    keyword?: string;
    metadata?: Record<string, unknown>;
  }): void {
    const db = getDb();
    db.prepare(`
      INSERT INTO lead_interactions (
        id, organization_id, lead_id, type, platform,
        external_id, campaign_id, content_id, keyword, metadata, created_at
      ) VALUES (?, ?, ?, ?, 'instagram', ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      randomUUID(),
      input.organizationId,
      input.leadId,
      input.type,
      input.externalId || null,
      input.campaignId || null,
      input.contentId || null,
      input.keyword || null,
      input.metadata ? JSON.stringify(input.metadata) : null
    );
  },

  recordMessageSent(organizationId: string, leadId: string, messageId: string, commentId: string): void {
    this._recordInteraction({
      organizationId,
      leadId,
      type: 'dm_sent',
      externalId: messageId,
      metadata: { comment_id: commentId, meta_message_id: messageId },
    });
  },

  recordMessageFailed(organizationId: string, leadId: string, errorCode: string, errorMsg: string): void {
    this._recordInteraction({
      organizationId,
      leadId,
      type: 'dm_failed',
      metadata: { error_code: errorCode, error_message: errorMsg },
    });
  },

  async addTag(organizationId: string, leadId: string, tagName: string): Promise<void> {
    const db = getDb();

    // Find or create tag
    let tag = db.prepare(`SELECT id FROM tags WHERE organization_id = ? AND name = ?`).get(organizationId, tagName) as { id: string } | undefined;

    if (!tag) {
      const tagId = randomUUID();
      db.prepare(`INSERT INTO tags (id, organization_id, name) VALUES (?, ?, ?)`).run(tagId, organizationId, tagName);
      tag = { id: tagId };
    }

    // Add to lead (ignore if already exists)
    db.prepare(`INSERT OR IGNORE INTO lead_tags (lead_id, tag_id) VALUES (?, ?)`).run(leadId, tag.id);
  },

  async recordTouchpoint(input: RecordTouchpointInput): Promise<void> {
    const db = getDb();

    // Count existing touchpoints
    const count = (db.prepare(`SELECT COUNT(*) as c FROM touchpoints WHERE lead_id = ?`).get(input.leadId) as { c: number }).c;
    const type = count === 0 ? 'first_touch' : 'mid_touch';

    db.prepare(`
      INSERT INTO touchpoints (
        id, organization_id, lead_id, touchpoint_order, type,
        platform, campaign_id, content_id, keyword, occurred_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      randomUUID(),
      input.organizationId,
      input.leadId,
      count + 1,
      type,
      input.platform,
      input.campaignId || null,
      input.contentId || null,
      input.keyword || null
    );

    // Always update last_touch in touchpoints
    if (count > 0) {
      db.prepare(`UPDATE touchpoints SET type = 'last_touch' WHERE lead_id = ? ORDER BY touchpoint_order DESC LIMIT 1`).run(input.leadId);
    }
  },

  updateStatus(organizationId: string, leadId: string, status: string): void {
    const db = getDb();
    db.prepare(`
      UPDATE leads SET status = ?, updated_at = datetime('now')
      WHERE id = ? AND organization_id = ?
    `).run(status, leadId, organizationId);

    this._recordInteraction({
      organizationId,
      leadId,
      type: 'status_change',
      metadata: { new_status: status },
    });
  },

  getLeadWithTimeline(organizationId: string, leadId: string) {
    const db = getDb();

    const lead = db.prepare(`
      SELECT l.*, GROUP_CONCAT(t.name) as tags
      FROM leads l
      LEFT JOIN lead_tags lt ON lt.lead_id = l.id
      LEFT JOIN tags t ON t.id = lt.tag_id
      WHERE l.id = ? AND l.organization_id = ?
      GROUP BY l.id
    `).get(leadId, organizationId);

    const interactions = db.prepare(`
      SELECT * FROM lead_interactions
      WHERE lead_id = ? AND organization_id = ?
      ORDER BY created_at DESC
    `).all(leadId, organizationId);

    const touchpoints = db.prepare(`
      SELECT * FROM touchpoints
      WHERE lead_id = ? AND organization_id = ?
      ORDER BY touchpoint_order ASC
    `).all(leadId, organizationId);

    return { lead, interactions, touchpoints };
  },

  listLeads(organizationId: string, filters: { status?: string; search?: string; limit?: number; offset?: number } = {}) {
    const db = getDb();
    const { status, search, limit = 50, offset = 0 } = filters;

    let query = `
      SELECT l.*, GROUP_CONCAT(t.name, ',') as tags
      FROM leads l
      LEFT JOIN lead_tags lt ON lt.lead_id = l.id
      LEFT JOIN tags t ON t.id = lt.tag_id
      WHERE l.organization_id = ?
    `;
    const params: unknown[] = [organizationId];

    if (status) {
      query += ` AND l.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (l.name LIKE ? OR l.instagram_username LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY l.id ORDER BY l.last_touch_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return db.prepare(query).all(...params);
  },
};
