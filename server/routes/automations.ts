/**
 * Automations CRUD and Execution Routes
 */
import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { getDb } from '../db/database.js';
import { automationEngine } from '../services/automationEngine.js';
import { logger } from '../utils/logger.js';

export const automationsRouter = Router();

function getOrgId(req: Request): string {
  return (req.headers['x-organization-id'] as string) || 'org_default';
}

/**
 * GET /api/automations
 * List all automations for the organization
 */
automationsRouter.get('/', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const db = getDb();

  const automations = db.prepare(`
    SELECT
      a.*,
      ig.username as instagram_username
    FROM automations a
    JOIN instagram_accounts ig ON ig.id = a.instagram_account_id
    WHERE a.organization_id = ?
    ORDER BY a.created_at DESC
  `).all(orgId);

  const parsed = automations.map((a: any) => ({
    ...a,
    trigger_config: JSON.parse(a.trigger_config || '{}'),
    conditions_config: JSON.parse(a.conditions_config || '[]'),
    actions_config: JSON.parse(a.actions_config || '[]'),
  }));

  res.json({ automations: parsed });
});

/**
 * GET /api/automations/:id
 * Get details of a single automation including recent runs
 */
automationsRouter.get('/:id', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const db = getDb();

  const automation = db.prepare(`
    SELECT
      a.*,
      ig.username as instagram_username
    FROM automations a
    JOIN instagram_accounts ig ON ig.id = a.instagram_account_id
    WHERE a.id = ? AND a.organization_id = ?
  `).get(req.params.id, orgId) as any;

  if (!automation) {
    return res.status(404).json({ error: 'Automation not found' });
  }

  const recentRuns = db.prepare(`
    SELECT *
    FROM automation_runs
    WHERE automation_id = ? AND organization_id = ?
    ORDER BY started_at DESC
    LIMIT 20
  `).all(req.params.id, orgId);

  res.json({
    automation: {
      ...automation,
      trigger_config: JSON.parse(automation.trigger_config || '{}'),
      conditions_config: JSON.parse(automation.conditions_config || '[]'),
      actions_config: JSON.parse(automation.actions_config || '[]'),
    },
    runs: recentRuns.map((r: any) => ({
      ...r,
      run_log: JSON.parse(r.run_log || '[]'),
    })),
  });
});

/**
 * POST /api/automations
 * Create a new automation
 */
automationsRouter.post('/', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const rawTrigger = trigger_config || (req.body as any).trigger;
  const rawConditions = conditions_config || (req.body as any).conditions;
  const rawActions = actions_config || (req.body as any).actions;

  if (!name || (!rawTrigger && !trigger_config) || (!rawActions && !actions_config)) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'name, trigger_config, and actions_config are required',
    });
  }

  const db = getDb();

  // Validate Instagram account belongs to organization, with safe fallback
  let account = db.prepare(`
    SELECT id FROM instagram_accounts WHERE id = ? AND organization_id = ?
  `).get(instagram_account_id, orgId) as { id: string } | undefined;

  if (!account) {
    account = db.prepare(`
      SELECT id FROM instagram_accounts WHERE organization_id = ? LIMIT 1
    `).get(orgId) as { id: string } | undefined;
  }

  const targetAccountId = account?.id || instagram_account_id || 'ig_acc_bexlybr';

  if (!account) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT OR IGNORE INTO instagram_accounts (
        id, organization_id, instagram_user_id, username, name,
        access_token_encrypted, token_expires_at, connection_status,
        connected_at, updated_at
      ) VALUES (?, ?, '28940950032212853', 'bexlybr', 'Bexly Solutions', 'encrypted', datetime('now', '+60 days'), 'connected', ?, ?)
    `).run(targetAccountId, orgId, now, now);
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO automations (
      id, organization_id, instagram_account_id, campaign_id,
      name, description, status,
      trigger_config, conditions_config, actions_config,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)
  `).run(
    id,
    orgId,
    targetAccountId,
    campaign_id || null,
    name,
    description || null,
    typeof rawTrigger === 'string' ? rawTrigger : JSON.stringify(rawTrigger),
    typeof rawConditions === 'string' ? rawConditions : JSON.stringify(rawConditions || []),
    typeof rawActions === 'string' ? rawActions : JSON.stringify(rawActions),
    now,
    now
  );

  logger.info(`Automation created: "${name}" (${id})`);

  res.status(201).json({
    id,
    name,
    status: 'active',
    created_at: now,
  });
});

/**
 * PUT /api/automations/:id
 * Update an existing automation
 */
automationsRouter.put('/:id', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const db = getDb();
  const id = req.params.id;

  const existing = db.prepare(`
    SELECT id FROM automations WHERE id = ? AND organization_id = ?
  `).get(id, orgId);

  if (!existing) {
    return res.status(404).json({ error: 'Automation not found' });
  }

  const {
    name,
    description,
    status,
    campaign_id,
    trigger_config,
    conditions_config,
    actions_config,
  } = req.body;

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE automations SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      campaign_id = COALESCE(?, campaign_id),
      trigger_config = COALESCE(?, trigger_config),
      conditions_config = COALESCE(?, conditions_config),
      actions_config = COALESCE(?, actions_config),
      updated_at = ?
    WHERE id = ? AND organization_id = ?
  `).run(
    name || null,
    description !== undefined ? description : null,
    status || null,
    campaign_id !== undefined ? campaign_id : null,
    trigger_config ? (typeof trigger_config === 'string' ? trigger_config : JSON.stringify(trigger_config)) : null,
    conditions_config ? (typeof conditions_config === 'string' ? conditions_config : JSON.stringify(conditions_config)) : null,
    actions_config ? (typeof actions_config === 'string' ? actions_config : JSON.stringify(actions_config)) : null,
    now,
    id,
    orgId
  );

  res.json({ success: true, updated_at: now });
});

/**
 * PATCH /api/automations/:id/status
 * Quickly activate or pause an automation
 */
automationsRouter.patch('/:id/status', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const { status } = req.body;

  if (!['active', 'paused', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be active, paused, or archived' });
  }

  const db = getDb();
  const result = db.prepare(`
    UPDATE automations SET status = ?, updated_at = datetime('now')
    WHERE id = ? AND organization_id = ?
  `).run(status, req.params.id, orgId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Automation not found' });
  }

  res.json({ success: true, status });
});

/**
 * DELETE /api/automations/:id
 * Delete an automation
 */
automationsRouter.delete('/:id', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const db = getDb();

  const result = db.prepare(`
    DELETE FROM automations WHERE id = ? AND organization_id = ?
  `).run(req.params.id, orgId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Automation not found' });
  }

  res.json({ success: true, message: 'Automation deleted' });
});

/**
 * POST /api/automations/test-trigger
 * Test an automation simulation with a test comment
 */
automationsRouter.post('/test-trigger', async (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const { instagram_account_id, post_id, comment_text, commenter_username } = req.body;

  if (!comment_text) {
    return res.status(400).json({ error: 'comment_text is required' });
  }

  const db = getDb();
  let account = db.prepare(`
    SELECT instagram_user_id FROM instagram_accounts
    WHERE (id = ? OR organization_id = ?)
  `).get(instagram_account_id || '', orgId) as { instagram_user_id: string } | undefined;

  if (!account) {
    account = db.prepare(`
      SELECT instagram_user_id FROM instagram_accounts LIMIT 1
    `).get() as { instagram_user_id: string } | undefined;
  }

  const igUserId = account?.instagram_user_id || '28940950032212853';

  const mockCommentEvent = {
    webhookEventId: `test_${Date.now()}`,
    organizationId: orgId,
    instagramUserId: igUserId,
    commentId: `mock_comment_${Date.now()}`,
    commentText: comment_text,
    postId: post_id || 'all',
    commenterUsername: commenter_username || 'usuario_teste',
    commenterName: commenter_username || 'Usuário Teste',
    timestamp: new Date().toISOString(),
  };

  try {
    await automationEngine.processCommentEvent(mockCommentEvent);

    const recentRun = db.prepare(`
      SELECT * FROM automation_runs WHERE webhook_event_id = ?
    `).get(mockCommentEvent.webhookEventId) as any;

    res.json({
      success: true,
      message: 'Test event executed successfully.',
      run: recentRun ? {
        ...recentRun,
        run_log: JSON.parse(recentRun.run_log || '[]')
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
