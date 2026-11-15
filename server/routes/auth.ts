import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';
import { ADMIN_EMAIL, resolveTenant, requireAdmin, UserRow } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

export const authRouter = Router();

/**
 * POST /api/auth/sync-user
 * Creates or synchronizes a user in the Bexly database upon sign up or login.
 * Guarantees that:
 * 1. brenooodesena@gmail.com is ALWAYS the exclusive 'admin' on 'org_default'.
 * 2. Every new user gets their OWN dedicated organization with ZERO access to admin data.
 */
authRouter.post('/sync-user', (req: Request, res: Response) => {
  const { id, email, name } = req.body;

  if (!email) {
    res.status(400).json({ error: 'E-mail é obrigatório para registrar o usuário.' });
    return;
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const db = getDb();

  try {
    const isAdmin = normalizedEmail === ADMIN_EMAIL;
    let organizationId: string;
    let organizationName: string;
    let role: 'admin' | 'user';

    if (isAdmin) {
      organizationId = 'org_default';
      organizationName = 'Bexly Admin Workspace';
      role = 'admin';
    } else {
      // Unique isolated organization for this user
      const cleanId = (id ? String(id).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 24) : '') ||
        Buffer.from(normalizedEmail).toString('hex').slice(0, 16);
      organizationId = `org_${cleanId}`;
      organizationName = `${name || normalizedEmail.split('@')[0]} Workspace`;
      role = 'user';
    }

    // 1. Ensure organization exists in database
    db.prepare(`
      INSERT INTO organizations (id, name, plan)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = datetime('now')
    `).run(organizationId, organizationName, isAdmin ? 'enterprise' : 'free');

    // 2. Insert or update user in database
    const userId = id || `usr_${Buffer.from(normalizedEmail).toString('hex').slice(0, 16)}`;
    db.prepare(`
      INSERT INTO users (id, email, name, role, organization_id)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name = COALESCE(excluded.name, users.name),
        role = CASE WHEN users.email = '${ADMIN_EMAIL}' THEN 'admin' ELSE 'user' END,
        updated_at = datetime('now')
    `).run(userId, normalizedEmail, name || normalizedEmail.split('@')[0], role, organizationId);

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as UserRow;
    const organization = db.prepare('SELECT * FROM organizations WHERE id = ?').get(organizationId);

    logger.info({
      event: 'user_synced_in_database',
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
      isAdmin,
    });

    res.json({
      success: true,
      user,
      organization,
      isAdmin,
    });
  } catch (err: any) {
    logger.error({ event: 'user_sync_error', error: String(err) });
    res.status(500).json({ error: 'Erro ao sincronizar usuário no banco de dados', message: err.message });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user and organization.
 */
authRouter.get('/me', (req: Request, res: Response) => {
  const { user, organizationId, isAdmin } = resolveTenant(req);
  const db = getDb();

  const organization = db.prepare('SELECT * FROM organizations WHERE id = ?').get(organizationId);

  res.json({
    user,
    organization,
    isAdmin,
    organizationId,
  });
});

/**
 * GET /api/auth/admin/users
 * Lists all registered users on Bexly.
 * EXCLUSIVE TO ADMIN (brenooodesena@gmail.com).
 */
authRouter.get('/admin/users', requireAdmin, (_req: Request, res: Response) => {
  const db = getDb();

  const users = db.prepare(`
    SELECT 
      u.id, 
      u.email, 
      u.name, 
      u.role, 
      u.organization_id, 
      u.created_at, 
      u.updated_at,
      o.name as organization_name,
      o.plan as organization_plan,
      (SELECT COUNT(*) FROM leads l WHERE l.organization_id = u.organization_id) as total_leads,
      (SELECT COUNT(*) FROM instagram_accounts ia WHERE ia.organization_id = u.organization_id) as total_ig_accounts
    FROM users u
    LEFT JOIN organizations o ON o.id = u.organization_id
    ORDER BY u.created_at DESC
  `).all();

  res.json({
    success: true,
    total: users.length,
    users,
  });
});

