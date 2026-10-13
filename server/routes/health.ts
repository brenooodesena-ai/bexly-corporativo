import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';
import { isMetaConfigured } from '../config/index.js';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  let dbStatus = 'ok';
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
  } catch (error: any) {
    dbStatus = `error: ${error.message}`;
  }

  res.json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    database: dbStatus,
    meta_configured: isMetaConfigured(),
    uptime: Math.round(process.uptime()),
    version: '2026.10.13-v3',
  });
});

healthRouter.get('/diagnostics', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const accounts = db.prepare(`SELECT id, username, name, instagram_user_id, connection_status, token_expires_at, connected_at FROM instagram_accounts`).all();
    const automations = db.prepare(`SELECT id, name, status, trigger_config, conditions_config, actions_config, total_triggers, total_matches, total_actions_executed, total_actions_failed FROM automations`).all();
    const recentWebhooks = db.prepare(`SELECT id, provider, event_type, external_event_id, status, error_message, received_at FROM webhook_events ORDER BY received_at DESC LIMIT 10`).all();
    const recentRuns = db.prepare(`SELECT id, automation_id, status, error_message, started_at, finished_at FROM automation_runs ORDER BY started_at DESC LIMIT 10`).all();
    const recentMessages = db.prepare(`SELECT id, status, message_text, error_code, error_message, meta_message_id, attempted_at FROM message_attempts ORDER BY attempted_at DESC LIMIT 10`).all();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        accounts: accounts.length,
        automations: automations.length,
        webhook_events: recentWebhooks.length,
        runs: recentRuns.length,
        messages: recentMessages.length,
      },
      accounts,
      automations,
      recent_webhooks: recentWebhooks,
      recent_runs: recentRuns,
      recent_messages: recentMessages,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
