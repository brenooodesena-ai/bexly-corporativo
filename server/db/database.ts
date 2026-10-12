/**
 * Database Layer — SQLite via better-sqlite3
 * Schema is designed to be compatible with PostgreSQL for future migration.
 *
 * All tables include tenant_id for multi-tenant isolation.
 * Tokens are stored ENCRYPTED — never in plaintext.
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return db;
}

export async function initializeDatabase(): Promise<void> {
  // Ensure data directory exists
  const dbPath = path.resolve(config.DATABASE_URL);
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);

  // Enable WAL mode for better concurrent performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations();

  // Ensure default organization exists
  db.prepare(`
    INSERT OR IGNORE INTO organizations (id, name, plan)
    VALUES ('org_default', 'Bexly Workspace', 'pro')
  `).run();

  logger.info(`Database initialized: ${dbPath}`);
}

function runMigrations(): void {
  const migrations = [migration_001_core_schema, migration_002_automation_engine, migration_003_attribution];

  for (const migration of migrations) {
    migration(db);
  }
}

// ── Migration 001: Core Schema ──
function migration_001_core_schema(db: Database.Database): void {
  db.exec(`
    -- Organizations (tenants)
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Instagram accounts connected to organizations
    -- access_token is stored ENCRYPTED via tokenEncryption service
    CREATE TABLE IF NOT EXISTS instagram_accounts (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      instagram_user_id TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL,
      name TEXT NOT NULL,
      profile_picture_url TEXT,
      followers_count INTEGER DEFAULT 0,
      media_count INTEGER DEFAULT 0,
      -- ENCRYPTED access token — NEVER store plaintext
      access_token_encrypted TEXT NOT NULL,
      token_expires_at TEXT,
      token_refreshed_at TEXT,
      connection_status TEXT NOT NULL DEFAULT 'connected'
        CHECK(connection_status IN ('connected','disconnected','token_expired','reauth_required','error')),
      error_message TEXT,
      connected_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_ig_accounts_org ON instagram_accounts(organization_id);
    CREATE INDEX IF NOT EXISTS idx_ig_accounts_user_id ON instagram_accounts(instagram_user_id);

    -- Raw webhook events — stored before processing for idempotency + audit
    CREATE TABLE IF NOT EXISTS webhook_events (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      provider TEXT NOT NULL DEFAULT 'meta',
      event_type TEXT NOT NULL,
      external_event_id TEXT NOT NULL,
      payload TEXT NOT NULL,  -- JSON string
      received_at TEXT NOT NULL DEFAULT (datetime('now')),
      processed_at TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','processing','processed','failed','duplicate')),
      error_message TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_idempotency ON webhook_events(provider, external_event_id);
    CREATE INDEX IF NOT EXISTS idx_webhook_events_org ON webhook_events(organization_id);
    CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);

    -- Leads native table
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT,
      instagram_username TEXT,
      instagram_user_id TEXT,  -- Official IG-scoped user ID when available
      profile_pic_url TEXT,
      source TEXT NOT NULL DEFAULT 'instagram',
      source_platform TEXT NOT NULL DEFAULT 'instagram',
      status TEXT NOT NULL DEFAULT 'novo'
        CHECK(status IN ('novo','contatado','qualificado','oportunidade','cliente','perdido')),
      first_touch_at TEXT,
      last_touch_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(organization_id);
    CREATE INDEX IF NOT EXISTS idx_leads_ig_user ON leads(instagram_user_id);
    CREATE INDEX IF NOT EXISTS idx_leads_ig_username ON leads(instagram_username);

    -- Lead interactions timeline
    CREATE TABLE IF NOT EXISTS lead_interactions (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      lead_id TEXT NOT NULL,
      type TEXT NOT NULL,  -- comment_detected, dm_sent, dm_failed, status_change, note, etc.
      platform TEXT NOT NULL DEFAULT 'instagram',
      external_id TEXT,  -- comment_id, message_id, etc.
      campaign_id TEXT,
      content_id TEXT,   -- post_id, reel_id
      keyword TEXT,
      metadata TEXT,     -- JSON string for flexible data
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_interactions_lead ON lead_interactions(lead_id);
    CREATE INDEX IF NOT EXISTS idx_interactions_org ON lead_interactions(organization_id);

    -- Tags
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#3b82f6',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(organization_id, name),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    -- Lead tags many-to-many
    CREATE TABLE IF NOT EXISTS lead_tags (
      lead_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (lead_id, tag_id),
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    -- Audit log
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      actor TEXT,        -- user_id or 'system'
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      changes TEXT,      -- JSON diff
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);
    CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
  `);
}

// ── Migration 002: Automation Engine ──
function migration_002_automation_engine(db: Database.Database): void {
  db.exec(`
    -- Campaigns
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','archived')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);

    -- Automations — serialized trigger/conditions/actions as JSON
    CREATE TABLE IF NOT EXISTS automations (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      instagram_account_id TEXT NOT NULL,
      campaign_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','archived')),
      -- Trigger: JSON { type, post_id, post_title }
      trigger_config TEXT NOT NULL,
      -- Conditions: JSON array [{ field, operator, value }]
      conditions_config TEXT NOT NULL,
      -- Actions: JSON array [{ type, config }]
      actions_config TEXT NOT NULL,
      -- Metrics aggregated
      total_triggers INTEGER NOT NULL DEFAULT 0,
      total_matches INTEGER NOT NULL DEFAULT 0,
      total_actions_executed INTEGER NOT NULL DEFAULT 0,
      total_actions_failed INTEGER NOT NULL DEFAULT 0,
      total_leads_generated INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (instagram_account_id) REFERENCES instagram_accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_automations_org ON automations(organization_id);
    CREATE INDEX IF NOT EXISTS idx_automations_account ON automations(instagram_account_id);
    CREATE INDEX IF NOT EXISTS idx_automations_status ON automations(status);

    -- Automation run logs — one row per execution attempt
    CREATE TABLE IF NOT EXISTS automation_runs (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      automation_id TEXT NOT NULL,
      webhook_event_id TEXT,
      lead_id TEXT,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      finished_at TEXT,
      status TEXT NOT NULL DEFAULT 'running'
        CHECK(status IN ('running','completed','failed','skipped')),
      -- Detailed step-by-step log: JSON array
      run_log TEXT NOT NULL DEFAULT '[]',
      error_message TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (automation_id) REFERENCES automations(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_runs_automation ON automation_runs(automation_id);
    CREATE INDEX IF NOT EXISTS idx_runs_org ON automation_runs(organization_id);
    CREATE INDEX IF NOT EXISTS idx_runs_status ON automation_runs(status);

    -- Message attempt log — records every DM/private reply attempt
    CREATE TABLE IF NOT EXISTS message_attempts (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      automation_run_id TEXT NOT NULL,
      lead_id TEXT,
      instagram_account_id TEXT NOT NULL,
      recipient_instagram_user_id TEXT,
      comment_id TEXT,  -- for private reply via comment_id
      message_text TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('sent','failed','blocked','permanent_error')),
      meta_message_id TEXT,  -- returned by Meta API on success
      error_code TEXT,
      error_message TEXT,
      is_retryable INTEGER NOT NULL DEFAULT 0,  -- 0=false, 1=true
      attempt_number INTEGER NOT NULL DEFAULT 1,
      attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (automation_run_id) REFERENCES automation_runs(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_msg_attempts_run ON message_attempts(automation_run_id);
    CREATE INDEX IF NOT EXISTS idx_msg_attempts_org ON message_attempts(organization_id);
  `);
}

// ── Migration 003: Attribution ──
function migration_003_attribution(db: Database.Database): void {
  db.exec(`
    -- Touchpoints for attribution
    CREATE TABLE IF NOT EXISTS touchpoints (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      lead_id TEXT NOT NULL,
      touchpoint_order INTEGER NOT NULL DEFAULT 1,
      type TEXT NOT NULL CHECK(type IN ('first_touch','mid_touch','last_touch')),
      platform TEXT NOT NULL,
      campaign_id TEXT,
      content_id TEXT,  -- post_id, page_id, etc.
      keyword TEXT,
      source_url TEXT,
      metadata TEXT,    -- JSON
      occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_touchpoints_lead ON touchpoints(lead_id);
    CREATE INDEX IF NOT EXISTS idx_touchpoints_org ON touchpoints(organization_id);

    -- Conversions
    CREATE TABLE IF NOT EXISTS conversions (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      lead_id TEXT NOT NULL,
      type TEXT NOT NULL,     -- sale, subscription, upsell, trial, etc.
      value REAL,
      currency TEXT DEFAULT 'BRL',
      source TEXT,
      campaign_id TEXT,
      content_id TEXT,
      provider TEXT,          -- stripe, mercadopago, hotmart, etc.
      external_id TEXT,       -- ID from payment provider
      metadata TEXT,          -- JSON
      converted_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_conversions_lead ON conversions(lead_id);
    CREATE INDEX IF NOT EXISTS idx_conversions_org ON conversions(organization_id);
  `);
}
