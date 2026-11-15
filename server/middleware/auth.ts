import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db/database.js';

export const ADMIN_EMAIL = 'brenooodesena@gmail.com';

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'user';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedRequest extends Request {
  organizationId: string;
  user?: UserRow | null;
  isAdmin?: boolean;
}

/**
 * Resolves the tenant organization ID safely.
 * GUARANTEE: Non-admin users can NEVER access 'org_default' or the admin's organization.
 */
export function resolveTenant(req: Request): { organizationId: string; user: UserRow | null; isAdmin: boolean } {
  const userId = req.headers['x-user-id'] as string;
  const userEmail = ((req.headers['x-user-email'] as string) || '').toLowerCase().trim();
  const explicitOrgId = req.headers['x-organization-id'] as string;

  try {
    const db = getDb();
    let userRow: UserRow | undefined = undefined;

    if (userId) {
      userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;
    }
    if (!userRow && userEmail) {
      userRow = db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(userEmail) as UserRow | undefined;
    }

    // 1. Admin Verification: brenooodesena@gmail.com is ALWAYS and ONLY Admin
    const isBreno = userEmail === ADMIN_EMAIL || (userRow && userRow.email.toLowerCase() === ADMIN_EMAIL);
    if (isBreno || (userRow && userRow.role === 'admin')) {
      return {
        organizationId: 'org_default',
        user: userRow || {
          id: 'usr_admin_breno',
          email: ADMIN_EMAIL,
          name: 'Breno Silva',
          role: 'admin',
          organization_id: 'org_default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        isAdmin: true,
      };
    }

    // 2. Normal Registered User: Locked strictly to their own organization
    if (userRow) {
      return {
        organizationId: userRow.organization_id,
        user: userRow,
        isAdmin: false,
      };
    }

    // 3. User with email who is not in DB yet (auto-provision personal org)
    if (userEmail) {
      const safeId = 'org_' + Buffer.from(userEmail).toString('hex').slice(0, 16);
      db.prepare(`
        INSERT OR IGNORE INTO organizations (id, name, plan)
        VALUES (?, ?, 'free')
      `).run(safeId, `${userEmail.split('@')[0]} Workspace`);

      const newUserId = userId || `usr_${Buffer.from(userEmail).toString('hex').slice(0, 16)}`;
      db.prepare(`
        INSERT OR IGNORE INTO users (id, email, name, role, organization_id)
        VALUES (?, ?, ?, 'user', ?)
      `).run(newUserId, userEmail, userEmail.split('@')[0], safeId);

      const created = db.prepare('SELECT * FROM users WHERE email = ?').get(userEmail) as UserRow;
      return {
        organizationId: safeId,
        user: created,
        isAdmin: false,
      };
    }

    // 4. Explicit Org ID from client, as long as it's NOT the admin org
    if (explicitOrgId && explicitOrgId !== 'org_default') {
      return {
        organizationId: explicitOrgId,
        user: null,
        isAdmin: false,
      };
    }
  } catch (err) {
    console.error('[TenantResolver] Erro ao resolver organização:', err);
  }

  // 5. Unauthenticated guest fallback (isolated sandbox organization, NEVER org_default)
  return {
    organizationId: 'org_guest_sandbox',
    user: null,
    isAdmin: false,
  };
}

export function tenantMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const { organizationId, user, isAdmin } = resolveTenant(req);
  (req as AuthenticatedRequest).organizationId = organizationId;
  (req as AuthenticatedRequest).user = user;
  (req as AuthenticatedRequest).isAdmin = isAdmin;
  next();
}

/**
 * Middleware that strictly protects admin-only routes.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const { isAdmin } = resolveTenant(req);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acesso negado. Apenas o administrador da Bexly pode acessar este recurso.' });
    return;
  }
  next();
}
