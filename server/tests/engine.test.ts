import { describe, it, expect, beforeAll } from 'vitest';
import { initializeDatabase, getDb } from '../db/database.js';
import { encryptToken, decryptToken } from '../services/tokenEncryption.js';
import { leadService } from '../services/leadService.js';
import { automationEngine } from '../services/automationEngine.js';

import fs from 'fs';

describe('Bexly Instagram Automation Engine & Lead System', () => {
  beforeAll(async () => {
    // Set test env
    process.env.DATABASE_URL = './server/data/test_bexly.db';
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    process.env.META_VERIFY_TOKEN = 'test_verify_token';

    // Delete previous test db if present
    for (const ext of ['', '-wal', '-shm']) {
      try { fs.unlinkSync(`./server/data/test_bexly.db${ext}`); } catch {}
    }

    await initializeDatabase();
  });

  describe('Token Encryption (AES-256-GCM)', () => {
    it('should encrypt and decrypt access token properly without data loss', () => {
      const originalToken = 'IGQVJXN1ZA...official_meta_token_secret_xyz123';
      const encrypted = encryptToken(originalToken);

      expect(encrypted).not.toBe(originalToken);
      expect(typeof encrypted).toBe('string');

      const decrypted = decryptToken(encrypted);
      expect(decrypted).toBe(originalToken);
    });

    it('should fail decryption if payload is tampered', () => {
      const originalToken = 'secret_token';
      const encrypted = encryptToken(originalToken);
      const tampered = encrypted.substring(0, encrypted.length - 4) + 'AAAA';

      expect(() => decryptToken(tampered)).toThrow();
    });
  });

  describe('Native Lead Management & Deduplication', () => {
    const orgId = 'org_default';

    it('should create new lead when no match exists', async () => {
      const result = await leadService.upsert({
        organizationId: orgId,
        instagramUserId: 'ig_user_1001',
        instagramUsername: 'ana_marketing',
        name: 'Ana Marketing',
        keyword: 'QUERO',
        sourcePostId: 'post_100',
      });

      expect(result.id).toBeDefined();
      expect(result.isNew).toBe(true);

      const data = leadService.getLeadWithTimeline(orgId, result.id);
      expect(data.lead).toBeDefined();
      expect(data.interactions.length).toBeGreaterThanOrEqual(1);
    });

    it('should deduplicate lead when same instagramUserId comments again', async () => {
      const first = await leadService.upsert({
        organizationId: orgId,
        instagramUserId: 'ig_user_2002',
        instagramUsername: 'carlos_growth',
        name: 'Carlos Growth',
        keyword: 'QUERO',
      });

      const second = await leadService.upsert({
        organizationId: orgId,
        instagramUserId: 'ig_user_2002',
        instagramUsername: 'carlos_growth',
        keyword: 'ABRIR',
      });

      expect(second.id).toBe(first.id);
      expect(second.isNew).toBe(false);

      const data = leadService.getLeadWithTimeline(orgId, first.id);
      expect(data.interactions.length).toBe(2);
    });

    it('should add tags and update pipeline status', async () => {
      const created = await leadService.upsert({
        organizationId: orgId,
        instagramUsername: 'mariana_vendas',
        name: 'Mariana Vendas',
      });

      await leadService.addTag(orgId, created.id, 'VIP');
      await leadService.addTag(orgId, created.id, 'Interesse Alto');

      leadService.updateStatus(orgId, created.id, 'qualificado');

      const data = leadService.getLeadWithTimeline(orgId, created.id);
      expect(data.lead.status).toBe('qualificado');
      expect(data.lead.tags).toContain('VIP');
      expect(data.lead.tags).toContain('Interesse Alto');
    });
  });

  describe('Automation Matching & Execution', () => {
    const orgId = 'org_default';

    it('should insert an automation and evaluate trigger condition', async () => {
      const db = getDb();

      // Create test account
      const encrypted = encryptToken('fake_access_token');
      db.prepare(`
        INSERT OR REPLACE INTO instagram_accounts (
          id, organization_id, instagram_user_id, username, name,
          access_token_encrypted, connection_status
        ) VALUES ('ig_acc_test', ?, 'ig_user_business_1', 'bexly_brand', 'Bexly Brand', ?, 'connected')
      `).run(orgId, encrypted);

      // Create automation: keyword 'QUERO'
      db.prepare(`
        INSERT OR REPLACE INTO automations (
          id, organization_id, instagram_account_id, name, status,
          trigger_config, conditions_config, actions_config
        ) VALUES (
          'auto_test_1',
          ?,
          'ig_acc_test',
          'Automação Quero Teste',
          'active',
          '{"type":"instagram.comment.created","post_id":"all"}',
          '[{"field":"comment_text","operator":"contains","value":"QUERO"}]',
          '[{"type":"lead.upsert","config":{}},{"type":"lead.add_tag","config":{"tag":"Lead Quero"}}]'
        )
      `).run(orgId);

      // Simulate comment
      await automationEngine.processCommentEvent({
        webhookEventId: `evt_${Date.now()}`,
        organizationId: orgId,
        instagramUserId: 'ig_user_business_1',
        commentId: `comment_${Date.now()}`,
        commentText: 'Eu QUERO esse material agora!',
        postId: 'post_promo_1',
        commenterUsername: 'interessado_99',
        commenterName: 'Usuário Interessado',
        timestamp: new Date().toISOString(),
      });

      // Verify lead was created and tagged
      const leads = leadService.listLeads(orgId, { search: 'interessado_99' });
      expect(leads.length).toBeGreaterThan(0);
      expect(leads[0].tags).toContain('Lead Quero');
    });
  });
});
